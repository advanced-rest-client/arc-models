/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/tools/tree/master/packages/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   transformers/postman-data-transformer.js
 */


// tslint:disable:variable-name Describing an API that's defined elsewhere.
// tslint:disable:no-any describes the API as best we are able today

import {PostmanBackupTransformer} from './postman-backup-transformer.js';

import {PostmanEnvTransformer} from './postman-env-transformer.js';

import {PostmanV1Transformer} from './postman-v1-transformer.js';

import {PostmanV2Transformer} from './postman-v2-transformer.js';

export {PostmanDataTransformer};

declare class PostmanDataTransformer {
  transform(data: any): any;
  recognizeVersion(data: any): any;
}