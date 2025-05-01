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
        await fetch(allOperationsCsvBaseUrl).then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to fetch CSV: ${response.statusText}`);
            }
            return response.text();
        }
        ).then((csvData) => {
            this.logger.debug('CSV data fetched successfully');
            let isHeaders = true;
            Readable.from(csvData as any)
                .pipe(csv({
                    separator: ';',
                    headers: true,
                    mapValues: ({ value }) => value.trim(),
                }))

                .on('data', (data) => {
                    if (isHeaders) {
                        isHeaders = false;
                        this.mcaComponentsStore.addOrUpdateMcaVersions({
                            p1Version: data._2,
                            p2Version: data._3,
                            p3Version: data._4,
                            p4Version: data._5,
                        });
                        return;
                    }
                    this.mcaComponentsStore.addOrUpdateMcaComponent({
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
                .on('end', () => {
                    this.logger.debug('CSV data parsed successfully');
                })
                .on('error', (error) => {
                    this.logger.debug(`Error parsing CSV: ${error.message}`);
                });
        }
        ).catch((error) => {
            this.logger.error(`Error fetching CSV: ${error.message}`);
        }
        );
    }
}