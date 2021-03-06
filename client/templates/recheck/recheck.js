Template.recheck.onRendered(function(){
  Session.set('recheckItem', {});
});


Template.recheck.helpers({
  // 数据库类别
  collections: function() {
    return [
      {
        'conn': 'k2.ViewSpot',
        // 'conn': 'poi.ViewSpot',
        'name': '景点'
      },
      {
        'conn': 'k2.Restaurant',
        'name': '美食'
      },
      {
        'conn': 'k2.Shopping',
        'name': '购物'
      },
      {
        'conn': 'poi.Hotel',
        'name': '酒店'
      },
      {
        'conn': 'k2.Locality',
        'name': '城市'
      }
    ]
  },

  // 数据状态
  'dataStatus': function(){
    return [
      {
        'status': 'uploaded',
        'name': '已上线'
      },
      {
        'status': 'checked',
        'name': '准备上线'
      },
      {
        'status': 'review',
        'name': '待复审'
      },
    ]
  },

  // 时间范围
  'timeLimits': function() {
    return [
      {
        'timeLimit': moment().subtract(1, 'd').startOf('day').unix() * 1000,
        'name': '最近一天',
        'operator': '$gt'
      },
      {
        'timeLimit': moment().subtract(3, 'd').startOf('day').unix() * 1000,
        'name': '最近三天',
        'operator': '$gt'
      },
      {
        'timeLimit': moment().subtract(7, 'd').startOf('day').unix() * 1000,
        'name': '最近一周',
        'operator': '$gt'
      },
      {
        'timeLimit': moment().subtract(14, 'd').startOf('day').unix() * 1000,
        'name': '最近两周',
        'operator': '$gt'
      }
    ]
  },

  // 已复审数据数目
  'checkedItemCnt': function() {
    Session.get('trigger-cal-checked');
    Meteor.call('checkedItemCnt', function(err, res){
      if(!err){
        Session.set('checkedItemCnt', res);
      }
    });
    return Session.get('checkedItemCnt');
  }
});

// Tracker.autorun(function(){
//   Meteor.call('checkedItemCnt', function(err, res){
//     if(!err){
//       Session.set('checkedItemCnt', res);
//     }
//   })
// })

Template.recheck.events({
  // 点击复审项目,展示修改内容
  'click .recheck-items': function(event) {
    var mid = $(event.target).attr('id');
    if(Session.get('recheckItem') && Session.get('recheckItem').pk === mid) {
      return;
    }
    $(event.target).siblings().removeClass("active");
    $(event.target).addClass("active");

    $('#showModified').prop('checked', false); //将只看修改的按钮取消
    var ns = $(event.target).attr('data-ns');
    Session.set('recheckItem', {'pk': mid, 'ns': ns});
    Meteor.subscribe('oplog', ns, new Mongo.ObjectID(mid), 0);
    Meteor.setTimeout(arrangeDiv, 2000);
  },

  // 选择复审项目
  'click input[name="ready-online"]': function(event){
    event.preventDefault();
    event.stopPropagation();
    var pk = $(event.target).parent().attr('id');
    if(event.target.checked){
      console.log('checked');
      Meteor.call('ready-online', pk);
    }else{
      console.log('unchecked');
      Meteor.call('unready-online', pk);
    }
    Session.set('trigger-cal-checked', Date.now());
  },

  // 待复审 => 全选/ 准备上线 => 全不选(每次只操作一列数据)
  'click .select-all': function(event){
    event.preventDefault();
    if($(event.target).hasClass("all-in")){
      // 点击‘全不选’ 的逻辑
      $(event.target).removeClass("all-in");
      $(event.target).text('全选');
      $('input[name="ready-online"]').each(function(index, elem){
        if($(elem).is(':checked')){
          $(elem).trigger('click');
        }
      });
    }else{
      // 点击‘全选’ 的逻辑
      $(event.target).addClass("all-in");
      $(event.target).text('全不选');
      $('input[name="ready-online"]').each(function(index, elem){
        if(!$(elem).is(':checked')){
          $(elem).trigger('click');
        }
      });
    }
  },

  // 批量上线
  'click .upload-btn': function(event){
    Meteor.call('bulk-upload', function(err, res){
      if(!err){
        alert('上线' + res.count + '个数据');
        Session.set('trigger-cal-checked', Date.now());
      }else{
        alert('批量上线出错');
      }
    });
  },

  // 筛选条件的展开/隐藏
  'click .btn-up-down': function(){
    if($('.recheck-filter-wrapper').hasClass("hidden")){
      $('.recheck-filter-wrapper').removeClass("hidden")
      $('.btn-up-down').text('隐藏');
      $('.up-down-filters').css({'border-bottom': ""});
    }else{
      $('.recheck-filter-wrapper').addClass("hidden");
      $('.btn-up-down').text('展开');
      $('.up-down-filters').css({'border-bottom': "1px solid #ccc"});

    }
  }
  // 'click .fc-pager-page': function(event){
  //   event.preventDefault();
  //   $('input[name="ready-online"]').each(function(index, elem){
  //     if(!$(elem).is(':checked')){
  //       $('.select-all').removeClass("all-in");
  //       $('.select-all').text('全选');
  //       return;
  //     }
  //   });
  //   $('.select-all').addClass("all-in");
  //   $('.select-all').text('全不选');
  // }
});