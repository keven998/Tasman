function getMongoCol(col){
  console.log(col);
  check(col, String);
  var curDB;
  if("ViewSpot" === col) {
    curDB = ViewSpot;
  }else if('Locality' === col) {
    curDB = Locality;
  }else if('Hotel' === col) {
    curDB = Hotel;
  }else if('Shopping' === col) {
    curDB = Shopping;
  }else if('Restaurant' === col) {
    curDB = Restaurant;
  }
  return curDB;
};

Meteor.methods({
  'search': function(collection, keyword){
    check(collection, String);
    check(keyword, String);
    var regexContent = '^' + keyword,
        re = new RegExp(regexContent),
        curDB = getMongoCol(collection);

    return ('Hotel' === collection)
      //hotel数据没有alias字段
      ? curDB.find({'zhName': {'$regex': re}}, {fields: {zhName: 1, desc: 1}, sort: {hotness: -1}}).fetch()
      : curDB.find({'alias': {'$regex': re}}, {fields: {zhName: 1, desc: 1}, sort: {hotness: -1}}).fetch();
  },
  // 根据洲的名字，查找国家
  'getCountriesByContinent': function(continents) {
    check(continents, Array);
    continents.map(function(ct) {
      var name = ct['continentName'];
      ct['countries'] = Country.find({'zhCont': name},  {'fields': {'zhName': 1, '_id': 1}}).fetch();
    })
    return continents;
  },

  //获取区域导航信息
  'getCitiesByLocalityId': function(mid, abroad) {
    check(mid, String);
    check(abroad, Boolean);
    var selector, index;
    if(abroad) {
      selector = {'locList._id': new Mongo.ObjectID(mid), 'locList': {'$size': 2}};
      index = 1;
    } else {
      selector = {'locList._id': new Mongo.ObjectID(mid), 'locList': {'$size': 3}};
      index = 2;
    }
    var options = {'sort': {'hotness': 1}, 'fields': {'locList': true} }
    // var s = ViewSpot.distinct('locList.2', {'locList._id': new Mongo.ObjectID(mid), 'locList': {'$size': 3}});
    var data = ViewSpot.find(selector, options).fetch();
    var names = data.map(
      function(x) {
        return x.locList[index].zhName;
      }
    );
    var ids = data.map(
      function(x) {
        return x.locList[index]._id._str;
      }
    );

    names = _.uniq(names);
    ids = _.uniq(ids);
    var temp = [];
    for (var i = 0, len = ids.length; i < len; i++) {
      temp.push({'zhName': names[i], '_id': ids[i]});
    }
    return temp;
  },
  // update online data, optional: desc
  'updateOnlineData': function(pk, desc) {
    check(pk, String);
    var entry = OplogPkList.findOne({'pk': pk});
    if(!entry) return;
    var ns = entry.ns,
        commitInfo = desc || (moment().unix() * 1000).toString(),
        col = ns.split('.')[1],
        branchCount = entry.branch && entry.branch.length || 0,
        snapshotId = branchCount + 1,
        updateContent = Meteor.call('stagedContent', ns, new Mongo.ObjectID(pk));
    // omit _id for secure
    var resFromOnline = getMongoCol(col).update({'_id': new Mongo.ObjectID(pk)}, {'$set': _.omit(updateContent, '_id')});
    // update CmsOplog
    var resFromCmsOplog = CmsOplog.update(
                              {'pk': new Mongo.ObjectID(pk), 'status': 'staged'},
                              {'$set': {'status': 'merged', 'snapshotId': snapshotId}},
                              {'multi': true});
    // update OplogList
    var resFromOplogPkList = OplogPkList.update(
                                {'pk': pk},
                                {'$addToSet': {'branch': {'snapshotId': snapshotId, 'desc': commitInfo}}});
    if(resFromOnline >= 1 && resFromCmsOplog >= 1 && resFromOplogPkList >= 1) {
      return {'code': 0};
    }else{
      return {'code': 1};
    }
  },
  // get staged content from CmsOplog collection
  'stagedContent': function(ns, pk){
    check(ns, String);
    check(pk, Meteor.Collection.ObjectID);
    return storageEngine.snapshot(ns, pk);
  },
  'deleteUser': function(userId){
    check(userId, String);
    var cnt = Meteor.users.remove({_id: userId});
    if(cnt === 1){
      return {'code': 0};
    } else {
      return {'code': 1};
    }
  }

});