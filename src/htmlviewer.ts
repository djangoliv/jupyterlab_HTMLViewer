import { IInstanceTracker } from '@jupyterlab/apputils';

import { IDocumentWidget } from '@jupyterlab/docregistry';

import { Token } from '@phosphor/coreutils';

import { HtmlViewer } from './widget';

export * from './widget';

/**
 * A class that tracks editor widgets.
 */
export interface IHtmlTracker
extends IInstanceTracker<IDocumentWidget<HtmlViewer>> {}

/* tslint:disable */
/**
 * The editor tracker token.
 */
export const IHtmlTracker = new Token<IHtmlTracker>(
    '@jupyterlab/htmlviewer:IHtmlTracker'
);
/* tslint:enable */
