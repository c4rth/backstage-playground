import { LoggerService, } from "@backstage/backend-plugin-api";
import { Config } from "@backstage/config";
import { McaComponentsStore } from "../database/mcaComponentStore";
import csv from 'csv-parser';
import { Readable } from 'stream';

export type McaOperationScheduledTaskOptions = {
    logger: LoggerService;
    mcaComponentsStore: McaComponentsStore;
    config: Config;
};

export class McaOperationScheduledTask {

    private readonly logger: LoggerService;
    private readonly mcaComponentsStore: McaComponentsStore;
    private readonly config: Config;

    constructor(options: McaOperationScheduledTaskOptions) {
        this.logger = options.logger;
        this.mcaComponentsStore = options.mcaComponentsStore;
        this.config = options.config;
    }

    static create(options: McaOperationScheduledTaskOptions) {
        return new McaOperationScheduledTask(options);
    }

    async runAsync() {
        const allOperationsCsvBaseUrl = this.config.getString('mcaComponents.operations.csvBaseUrl');
        this.logger.debug(`Scheduled task: get all operations CSV from ${allOperationsCsvBaseUrl}`);

        try {
            const response = await fetch(allOperationsCsvBaseUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch CSV: ${response.statusText}`);
            }

            const csvData = await response.text();
            this.logger.debug('CSV data fetched successfully');

            return new Promise<void>((resolve, reject) => {
                const components: Array<any> = [];
                let mcaVersions: any = null;
                let isFirstRow = true;

                Readable.from(csvData)
                    .pipe(csv({
                        separator: ';',
                        headers: true,
                        mapValues: ({ value }) => value.trim(),
                    }))
                    .on('data', data => {
                        if (isFirstRow) {
                            isFirstRow = false;
                            mcaVersions = {
                                p1Version: data._2,
                                p2Version: data._3,
                                p3Version: data._4,
                                p4Version: data._5,
                            };
                            return;
                        }

                        components.push({
                            component: data._0,
                            prdVersion: data._1,
                            p1Version: data._2,
                            p2Version: data._3,
                            p3Version: data._4,
                            p4Version: data._5,
                            applicationCode: data._6,
                            packageName: data._7,
                        });
                    })
                    .on('end', async () => {
                        try {
                            // Batch database operations
                            const promises = [];

                            if (mcaVersions) {
                                promises.push(this.mcaComponentsStore.addOrUpdateMcaVersions(mcaVersions));
                            }

                            // Batch component updates
                            if (components.length > 0) {
                                promises.push(
                                    Promise.all(
                                        components.map(component =>
                                            this.mcaComponentsStore.addOrUpdateMcaComponent(component)
                                        )
                                    )
                                );
                            }

                            await Promise.all(promises);
                            this.logger.debug(`CSV data parsed successfully. Processed ${components.length} components`);
                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    })
                    .on('error', error => {
                        this.logger.error(`Error parsing CSV: ${error.message}`);
                        reject(error);
                    });
            });

        } catch (error: any) {
            this.logger.error(`Error fetching CSV: ${error.message}`);
        }
    }
}