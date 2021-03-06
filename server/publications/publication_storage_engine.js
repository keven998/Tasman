// CmsOplog = new Mongo.Collection('CmsOplog');
// OplogPkList = new Mongo.Collection('OplogPkList');

/**
 * 发布oplog信息
 * @param  {string} ns     oplog对应的namespace，如'geo.Locality'
 * @param  {ObjectId} pk     oplog对应数据的主键
 * @param  {int} count 取最后多少条记录。如果为undefined，则取所有记录
 */
Meteor.publish('oplog', function(ns, pk, count) {
  check(ns, String);
  check(pk, Meteor.Collection.ObjectID);
  check(count, Number);
  var query = {'ns': ns, 'pk': pk};
  if (count === 0) {
    return CmsOplog.find(query, {sort: {ts: -1}});
  } else {
    return CmsOplog.find(query, {sort: {ts: -1}, limit: count});
  }
});

// TODO allow settings
CmsOplog.allow({
  insert: function(){
    return true;
  },
  update: function(){
    return true;
  }
});


Meteor.methods({
  /**
   * 更新OplogPkList
   * @param  {[type]} ts     timestamp,时间戳
   * @param  {[type]} ns     namespace,如poi.ViewSpot
   * @param  {[type]} userId [description]
   * @param  {[type]} pk     [description]
   * @param  {[type]} zhName [description]
   * @return {[type]}        [description]
   */
  
});

Meteor.publish('oplog-pk-list', function(pk){
  check(pk, String);
  return OplogPkList.find({'pk': pk});
});