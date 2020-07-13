export const ArcModelEventTypes = {
  destroy: 'modeldestroy',
  destroyed: 'modeldestroyed',
  Project: {
    read: 'modelprojectread',
    update: 'modelprojectchange',
    updateBulk: 'modelprojectupdatebulk',
    delete: 'modelprojectdelete',
    query: 'modelprojectquery',
    State: {
      update: 'modelstateprojectchange',
      delete: 'modelstateprojectdelete',
    }
  },
  Request: {
    read: 'modelrequestread',
    readBulk: 'modelrequestreadbulk',
    // updates metadata only
    update: 'modelrequestchange',
    updateBulk: 'modelrequestupdatebulk',
    // updates metadata, transforms body, takes care of dependencies
    store: 'modelrequeststore',
    delete: 'modelrequestdelete',
    deleteBulk: 'modelrequestdeletebulk',
    undeleteBulk: 'modelrequestsundelete',
    query: 'modelrequestquery',
    list:  'modelrequestlist',
    projectlist: 'modelrequestprojectlist',
    State: {
      update: 'modelstaterequestchange',
      delete: 'modelstaterequestdelete',
    },
  },
  UrlIndexer: {
    update: 'modelurlindexerupdate',
    query: 'modelurlindexerquery',
    State: {
      finished: 'modelstateurlindexerfinished'
    }
  },
  AuthData: {
    query: 'modelauthdataquery',
    update: 'modelauthdataupdate',
    State: {
      update: 'modelstateauthdataupdate'
    },
  },
};
Object.freeze(ArcModelEventTypes);
Object.freeze(ArcModelEventTypes.Project);
Object.freeze(ArcModelEventTypes.Project.State);
Object.freeze(ArcModelEventTypes.Project);
Object.freeze(ArcModelEventTypes.Request.State);
Object.freeze(ArcModelEventTypes.UrlIndexer);
Object.freeze(ArcModelEventTypes.UrlIndexer.State);
Object.freeze(ArcModelEventTypes.AuthData);
Object.freeze(ArcModelEventTypes.AuthData.State);
