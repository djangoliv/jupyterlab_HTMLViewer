import { PathExt } from '@jupyterlab/coreutils';

import {
    ABCWidgetFactory,
    DocumentRegistry,
    IDocumentWidget,
    DocumentWidget
} from '@jupyterlab/docregistry';

import { PromiseDelegate } from '@phosphor/coreutils';

import { Message } from '@phosphor/messaging';

import { Widget } from '@phosphor/widgets';

/**
 * The class name added to a htmlviewer.
 */
const HTML_CLASS = 'jp-HtmlViewer';

/**
 * A widget for HTML.
 */
export class HtmlViewer extends Widget {
    /**
     * Construct a new html widget.
     */
    constructor(context: DocumentRegistry.Context) {
        super();
        this.context = context;
        this.node.tabIndex = -1;
        this.addClass(HTML_CLASS);

        this._html = document.createElement('iframe');
        this._html.setAttribute('height', "100%");
        this._html.setAttribute('width', "100%");
        this.node.appendChild(this._html);

        this._onTitleChanged();
        context.pathChanged.connect(
            this._onTitleChanged,
            this
        );

        context.ready.then(() => {
            if (this.isDisposed) {
                return;
            }
            this._render();
            context.model.contentChanged.connect(
                this.update,
                this
            );
            context.fileChanged.connect(
                this.update,
                this
            );
            this._ready.resolve(void 0);
        });
    }

    /**
     * The html widget's context.
     */
    readonly context: DocumentRegistry.Context;

    /**
     * A promise that resolves when the html viewer is ready.
     */
    get ready(): Promise<void> {
        return this._ready.promise;
    }

    /**
     * Handle `update-request` messages for the widget.
     */
    protected onUpdateRequest(msg: Message): void {
        if (this.isDisposed || !this.context.isReady) {
            return;
        }
        this._render();
    }

    /**
     * Handle `'activate-request'` messages.
     */
    protected onActivateRequest(msg: Message): void {
        this.node.focus();
    }

    /**
     * Handle a change to the title.
     */
    private _onTitleChanged(): void {
        this.title.label = PathExt.basename(this.context.localPath);
    }

    /**
     * Render the widget content.
     */
    private _render(): void {
        let context = this.context;
        let cm = context.contentsModel;
        if (!cm) {
            return;
        }
        let url = this.node.baseURI.replace("/lab", "/files/") + this.context.path;
        this._html.setAttribute('src', url);
    }

    private _ready = new PromiseDelegate<void>();
    private _html: HTMLElement;
}

/**
 * A widget factory for html
 */
export class HtmlViewerFactory extends ABCWidgetFactory<
    IDocumentWidget<HtmlViewer>
    > {
    /**
     * Create a new widget given a context.
     */
    protected createNewWidget(
        context: DocumentRegistry.IContext<DocumentRegistry.IModel>
    ): IDocumentWidget<HtmlViewer> {
        const content = new HtmlViewer(context);
        const widget = new DocumentWidget({ content, context });
        return widget;
    }
}
