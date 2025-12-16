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

    _getColumns(columnNumber: number) {
        const baseColumns = {
            'component': '_0',
            'prdVersion': '_1',
            'p1Version': '_2',
            'p2Version': '_3',
            'p3Version': columnNumber >= 7 ? '_4' : undefined,
            'p4Version': columnNumber === 8 ? '_5' : undefined,
            'applicationCode': `_${columnNumber >= 7 ? columnNumber - 2 : 4}`,
            'packageName': `_${columnNumber >= 7 ? columnNumber - 1 : 5}`,
        };
        return baseColumns;
    }

    async runAsync() {
        const allOperationsCsvBaseUrl = this.config.getString('mcaComponents.operations.csvBaseUrl');
        this.logger.info(`Scheduled task: get all operations CSV from ${allOperationsCsvBaseUrl}`);
        try {
            const response = await fetch(allOperationsCsvBaseUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch CSV: ${response.statusText}`);
            }

            const csvData = await response.text();
            this.logger.info('CSV data fetched successfully');

            return new Promise<void>((resolve, reject) => {
                const components: Array<any> = [];
                let mcaVersions: any = null;
                let isFirstRow = true;
                let columns: any = null;

                Readable.from(csvData)
                    .pipe(csv({
                        separator: ';',
                        headers: true,
                        mapValues: ({ value }) => value.trim(),
                    }))
                    .on('data', data => {
                        try {
                            if (isFirstRow) {
                                isFirstRow = false;
                                // Detect number of columns from first row
                                const columnCount = Object.keys(data).length;
                                columns = this._getColumns(columnCount);
                                mcaVersions = {
                                    p1Version: data[columns.p1Version],
                                    p2Version: data[columns.p2Version],
                                    p3Version: columns.p3Version ? data[columns.p3Version] : '',
                                    p4Version: columns.p4Version ? data[columns.p4Version] : '',
                                };
                            }
                            components.push({
                                component: data[columns.component],
                                prdVersion: data[columns.prdVersion],
                                p1Version: data[columns.p1Version],
                                p2Version: data[columns.p2Version],
                                p3Version: columns.p3Version ? data[columns.p3Version] : '',
                                p4Version: columns.p4Version ? data[columns.p4Version] : '',
                                applicationCode: data[columns.applicationCode],
                                packageName: data[columns.packageName],
                            });
                        } catch (error) {
                            this.logger.error(`Error processing row: ${error}`);
                        }
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
                            this.logger.info(`CSV data parsed successfully. Processed ${components.length} components`);
                            resolve();
                        } catch (error) {
                            this.logger.error(`Error updating database: ${error}`);
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
            throw error;
        }
    }
}