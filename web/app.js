require.config({
    baseUrl: "scripts/",
    urlArgs: "bust=" + (new Date()).getTime(),

    paths: {
        "react": "../lib/react-with-addons",
        "JSXTransformer": "../lib/JSXTransformer",
        'jsx': '../lib/jsx',
        'text': '../lib/text',
    },

    jsx: {
        fileExtension: '.jsx',
        harmony: true,
        stripTypes: true
    }
});

require([
    'react',
    'jsx!ui/Application',
    'AccessBase',
    'Client'
], function (React, Application, AccessBase, Client) {

    var client = new Client('/api');
    var accessBase = AccessBase.remote(client);

    var AppFactory = React.createFactory(Application);
    var app = AppFactory({accessBase: accessBase});

    React.render(app, document.getElementById('content'));
});
