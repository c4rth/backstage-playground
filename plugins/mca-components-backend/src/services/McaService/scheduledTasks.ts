import csv from 'csv-parser';
import { Readable } from 'stream';
import { Config } from "@backstage/config";
import { LoggerService } from '@backstage/backend-plugin-api';
import { McaComponentsStore } from '../../database/mcaComponentStore';
import * as cheerio from 'cheerio';

export async function taskAllOperationsCsv(
    logger: LoggerService,
    config: Config,
    mcaComponentsStore: McaComponentsStore,
) {
    const allOperationsCsvBaseUrl = config.getString('mcaComponents.operations.csvBaseUrl');
    logger.info(`Scheduled task: get all operations CSV from ${allOperationsCsvBaseUrl}`);
    await fetch(allOperationsCsvBaseUrl).then((response) => {
        if (!response.ok) {
            throw new Error(`Failed to fetch CSV: ${response.statusText}`);
        }
        return response.text();
    }
    ).then((csvData) => {
        logger.info('CSV data fetched successfully');
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
                    mcaComponentsStore.addOrUpdateMcaVersions({
                        p1Version: data._2,
                        p2Version: data._3,
                        p3Version: data._4,
                        p4Version: data._5,
                    });
                    return;
                }
                mcaComponentsStore.addOrUpdateMcaComponent({
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
                logger.info('CSV data parsed successfully');
            })
            .on('error', (error) => {
                logger.error(`Error parsing CSV: ${error.message}`);
            });
    }
    ).catch((error) => {
        logger.error(`Error fetching CSV: ${error.message}`);
    }
    );
}

export async function taskBaseTypes(
    logger: LoggerService,
    config: Config,
    mcaComponentsStore: McaComponentsStore,
) {
    const listBaseTypesBaseUrl = config.getString('mcaComponents.baseTypes.listBaseUrl');
    logger.info(`Scheduled task: get basetypes from ${listBaseTypesBaseUrl}`);
    await fetch(listBaseTypesBaseUrl).then((response) => {
        if (!response.ok) {
            throw new Error(`Failed to fetch BaseTypes HTML: ${response.statusText}`);
        }
        return response.text();
    }
    ).then((htmlPage) => {
        logger.info('BaseTypes HTML fetched successfully');
        const $ = cheerio.load(htmlPage);
        const listItems = $('div.indexContainer li');
        listItems.each((_index, element) => {
            const baseType = $(element).find('a').text().trim();
            const url = $(element).find('a').attr('href');
            const packageName = ($(element).find('a').attr('title') ?? 'not found').replace(/^(class in|interface in)\s*/, '').trim();
            if (url) {
                mcaComponentsStore.addOrUpdateBaseType({
                    baseType,
                    packageName,
                });
            }
        });
    }
    ).catch((error) => {
        logger.error(`Error fetching BaseTypes HTML: ${error.message}`);
    }
    );

}