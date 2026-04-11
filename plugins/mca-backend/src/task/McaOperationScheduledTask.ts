import { LoggerService, } from "@backstage/backend-plugin-api";
import { Config } from "@backstage/config";
import csv from 'csv-parser';
import { Readable } from 'stream';
import { McaComponentStore } from "../database";

export type McaOperationScheduledTaskOptions = {
    logger: LoggerService;
    mcaComponentsStore: McaComponentStore;
    config: Config;
};

export class McaOperationScheduledTask {

    private readonly logger: LoggerService;
    private readonly mcaComponentsStore: McaComponentStore;
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
        // Columns 4-8: component, prdVersion are first 2; applicationCode, packageName are last 2
        // Middle columns (0-4): p1Version, p2Version, p3Version, p4Version
        const baseColumns = {
            'component': '_0',
            'prdVersion': '_1',
            'p1Version': columnNumber >= 5 ? '_2' : undefined,
            'p2Version': columnNumber >= 6 ? '_3' : undefined,
            'p3Version': columnNumber >= 7 ? '_4' : undefined,
            'p4Version': columnNumber >= 8 ? '_5' : undefined,
            'applicationCode': `_${columnNumber - 2}`,
            'packageName': `_${columnNumber - 1}`,
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
                                    p1Version: columns.p1Version ? data[columns.p1Version] : '',
                                    p2Version: columns.p2Version ? data[columns.p2Version] : '',
                                    p3Version: columns.p3Version ? data[columns.p3Version] : '',
                                    p4Version: columns.p4Version ? data[columns.p4Version] : '',
                                };
                                return; // Skip processing first row as component
                            }
                            if (!data[columns.component].startsWith('Operation') && !data[columns.component].startsWith('Element')) return;
                            components.push({
                                component: data[columns.component],
                                prdVersion: data[columns.prdVersion],
                                p1Version: columns.p1Version ? data[columns.p1Version] : '',
                                p2Version: columns.p2Version ? data[columns.p2Version] : '',
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