import { Config } from "@backstage/config";
import { LoggerService } from '@backstage/backend-plugin-api';
import { McaComponentsStore } from '../database/mcaComponentStore';
import * as cheerio from 'cheerio';

export type McaBaseTypeScheduledTaskOptions = {
    logger: LoggerService;
    mcaComponentsStore: McaComponentsStore;
    config: Config;
};

export class McaBaseTypeScheduledTask {

    private readonly logger: LoggerService;
    private readonly mcaComponentsStore: McaComponentsStore;
    private readonly config: Config;

    constructor(options: McaBaseTypeScheduledTaskOptions) {
        this.logger = options.logger;
        this.mcaComponentsStore = options.mcaComponentsStore;
        this.config = options.config;
    }

    static create(options: McaBaseTypeScheduledTaskOptions) {
        return new McaBaseTypeScheduledTask(options);
    }

    async runAsync() {
        const listBaseTypesBaseUrl = this.config.getString('mcaComponents.baseTypes.listBaseUrl');
        this.logger.debug(`Scheduled task: get basetypes from ${listBaseTypesBaseUrl}`);

        try {
            const response = await fetch(listBaseTypesBaseUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch BaseTypes HTML: ${response.statusText}`);
            }

            const htmlPage = await response.text();
            this.logger.debug('BaseTypes HTML fetched successfully');

            const $ = cheerio.load(htmlPage);
            const baseTypes: Array<{ baseType: string; packageName: string }> = [];

            // Extract all base types first
            $('div.indexContainer li').each((_index, element) => {
                const $element = $(element);
                const $link = $element.find('a');
                const url = $link.attr('href');

                if (url) {
                    const baseType = $link.text().trim();
                    const packageName = ($link.attr('title') ?? 'not found')
                        .replace(/^(class in|interface in)\s*/, '')
                        .trim();

                    baseTypes.push({ baseType, packageName });
                }
            });

            // Batch update to reduce database calls
            if (baseTypes.length > 0) {
                await Promise.all(
                    baseTypes.map(item =>
                        this.mcaComponentsStore.addOrUpdateBaseType(item)
                    )
                );
                this.logger.debug(`Processed ${baseTypes.length} base types`);
            }
        } catch (error: any) {
            this.logger.error(`Error fetching BaseTypes HTML: ${error.message}`);
        }

    }
}