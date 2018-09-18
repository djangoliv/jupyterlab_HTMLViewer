
import {
    ILayoutRestorer,
    JupyterLab,
    JupyterLabPlugin
} from '@jupyterlab/application';

import { ICommandPalette, InstanceTracker } from '@jupyterlab/apputils';

import { IDocumentWidget } from '@jupyterlab/docregistry';

import {
    HtmlViewer,
    HtmlViewerFactory,
    IHtmlTracker
} from './htmlviewer';

/**
 * The list of file types for html.
 */
const FILE_TYPES = ['html', 'xhtml'];

/**
 * The name of the factory that creates html widgets.
 */
const FACTORY = 'Html';

/**
 * The html file handler extension.
 */
const plugin: JupyterLabPlugin<IHtmlTracker> = {
    activate,
    id: '@jupyterlab/htmlviewer-extension:plugin',
    provides: IHtmlTracker,
    requires: [ICommandPalette, ILayoutRestorer],
    autoStart: true
};

/**
 * Export the plugin as default.
 */
export default plugin;

/**
 * Activate the html widget extension.
 */
function activate(
    app: JupyterLab,
    palette: ICommandPalette,
    restorer: ILayoutRestorer
): IHtmlTracker {
    const namespace = 'html-widget';
    const factory = new HtmlViewerFactory({
        name: FACTORY,
        modelName: 'base64',
        fileTypes: FILE_TYPES,
        defaultFor: FILE_TYPES,
        readOnly: true
    });
    const tracker = new InstanceTracker<IDocumentWidget<HtmlViewer>>({
        namespace
    });

    // Handle state restoration.
    restorer.restore(tracker, {
        command: 'docmanager:open',
        args: widget => ({ path: widget.context.path, factory: FACTORY }),
        name: widget => widget.context.path
    });

    app.docRegistry.addWidgetFactory(factory);

    factory.widgetCreated.connect((sender, widget) => {
        // Notify the instance tracker if restore data needs to update.
        widget.context.pathChanged.connect(() => {
            tracker.save(widget);
        });
        tracker.add(widget);

        const types = app.docRegistry.getFileTypesForPath(widget.context.path);

        if (types.length > 0) {
            widget.title.iconClass = types[0].iconClass;
            widget.title.iconLabel = types[0].iconLabel;
        }
    });

    return tracker;
}


