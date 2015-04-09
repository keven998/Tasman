Template.shopProvince.helpers({
  province: function() {
    var provs = ["北京", "天津", "河北", "山西", "内蒙古", "辽宁", "吉林", "黑龙江", "上海", "江苏", "浙江", "安徽", "福建", "江西", "山东", "河南", "湖北", "湖南", "广东", "广西", "海南", "重庆", "四川", "贵州", "云南", "西藏", "陕西", "甘肃", "青海", "宁夏", "新疆", "台湾", "香港", "澳门"];
    var temp = [];
    provs.map(function(x) {
      temp.push({
        'name': x,
        'url': '/data-review/shopping/china/' + x
      })
    });
    return temp;
  },
});