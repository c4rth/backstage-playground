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
        await fetch(listBaseTypesBaseUrl).then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to fetch BaseTypes HTML: ${response.statusText}`);
            }
            return response.text();
        }
        ).then((htmlPage) => {
            this.logger.debug('BaseTypes HTML fetched successfully');
            const $ = cheerio.load(htmlPage);
            const listItems = $('div.indexContainer li');
            listItems.each((_index, element) => {
                const baseType = $(element).find('a').text().trim();
                const url = $(element).find('a').attr('href');
                const packageName = ($(element).find('a').attr('title') ?? 'not found').replace(/^(class in|interface in)\s*/, '').trim();
                if (url) {
                    this.mcaComponentsStore.addOrUpdateBaseType({
                        baseType,
                        packageName,
                    });
                }
            });
        }
        ).catch((error) => {
            this.logger.error(`Error fetching BaseTypes HTML: ${error.message}`);
        }
        );
    }
}