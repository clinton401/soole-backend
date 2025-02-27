"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Nobox = exports.createKeyGroupSchema = exports.createRowSchema = exports.config = void 0;
const nobox_client_1 = require("nobox-client");
const variables_1 = require("../config/variables");
exports.config = {
    endpoint: variables_1.NOBOX_ENDPOINT,
    project: variables_1.NOBOX_PROJECT,
    token: variables_1.NOBOX_TOKEN
};
exports.createRowSchema = (0, nobox_client_1.getSchemaCreator)(exports.config, { type: "rowed" });
exports.createKeyGroupSchema = (0, nobox_client_1.getSchemaCreator)(exports.config, {
    type: "key-group",
});
exports.Nobox = (0, nobox_client_1.getFunctions)(exports.config);
