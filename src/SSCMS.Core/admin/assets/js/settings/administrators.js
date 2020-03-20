﻿var $url = '/admin/settings/administrators';
var $urlUpload = $apiUrl + '/admin/settings/administrators/actions/import';

var data = utils.initData({
  drawer: false,
  administrators: null,
  count: null,
  roles: null,
  isSuperAdmin: null,
  adminId: null,
  formInline: {
    role: '',
    order: '',
    lastActivityDate: 0,
    keyword: '',
    currentPage: 1,
    offset: 0,
    limit: 30
  },
  permissionInfo: {},
  uploadPanel: false,
  uploadLoading: false,
  uploadList: []
});

var methods = {
  apiGet: function () {
    var $this = this;

    $api.get($url, {
      params: this.formInline
    }).then(function (response) {
      var res = response.data;

      $this.administrators = res.administrators;
      $this.count = res.count;
      $this.roles = res.roles;
      $this.isSuperAdmin = res.isSuperAdmin;
      $this.adminId = res.adminId;
    }).catch(function (error) {
      utils.error($this, error);
    }).then(function () {
      utils.loading($this, false);
    });
  },

  apiDelete: function (item) {
    var $this = this;

    utils.loading(this, true);
    $api.delete($url, {
      data: {
        id: item.id
      }
    }).then(function (response) {
      var res = response.data;

      $this.administrators.splice($this.administrators.indexOf(item), 1);
    }).catch(function (error) {
      utils.error($this, error);
    }).then(function () {
      utils.loading($this, false);
    });
  },

  apiLock: function (item) {
    var $this = this;

    utils.loading(this, true);
    $api.post($url + '/actions/lock', {
      id: item.id
    }).then(function (response) {
      var res = response.data;

      item.locked = true;
    }).catch(function (error) {
      utils.error($this, error);
    }).then(function () {
      utils.loading($this, false);
    });
  },

  apiUnLock: function (item) {
    var $this = this;

    utils.loading(this, true);
    $api.post($url + '/actions/unLock', {
      id: item.id
    }).then(function (response) {
      var res = response.data;

      item.locked = false;
    }).catch(function (error) {
      utils.error($this, error);
    }).then(function () {
      utils.loading($this, false);
    });
  },

  btnEditClick: function(row) {
    location.href = utils.getSettingsUrl('administratorsProfile', {pageType: 'admin', userId: row.id});
  },

  btnPasswordClick: function(row) {
    location.href = utils.getSettingsUrl('administratorsPassword', {pageType: 'admin', userId: row.id});
  },

  btnPermissionsClick: function(row) {
    var $this = this;

    utils.loading(this, true);
    $api.get($url + '/permissions/' + row.id).then(function (response) {
      var res = response.data;

      var allRoles = [];
      for (var i = 0; i < res.roles.length; i++) {
        allRoles.push({ 
          key: res.roles[i], 
          label: res.roles[i], 
          disabled: false
        });
      }

      $this.permissionInfo = {
        adminId: row.id,
        allRoles: allRoles,
        allSites: res.allSites,
        
        adminLevel: res.adminLevel,
        checkedSites: res.checkedSites,
        checkedRoles: res.checkedRoles,
        loading: false
      };

      $this.drawer = true;
    }).catch(function (error) {
      utils.error($this, error);
    }).then(function () {
      utils.loading($this, false);
    });
  },

  btnPermissionSubmitClick: function() {
    var $this = this;
    this.permissionInfo.loading = true;

    $api.post($url + '/permissions/' + this.permissionInfo.adminId, {
      adminLevel: this.permissionInfo.adminLevel,
      checkedSites: this.permissionInfo.checkedSites,
      checkedRoles: this.permissionInfo.checkedRoles,
    }).then(function (response) {
      var res = response.data;

      for (var i = 0; i < $this.administrators.length; i++) {
        var adminInfo = $this.administrators[i];
        if (adminInfo.id === $this.permissionInfo.adminId) {
          adminInfo.roles = res.roles;
        }
      }

      $this.drawer = false;
    }).catch(function (error) {
      utils.error($this, error);
    }).then(function () {
      utils.loading($this, false);
    });
  },

  btnDeleteClick: function (item) {
    var $this = this;

    utils.alertDelete({
      title: '删除管理员',
      text: '此操作将删除管理员 ' + item.userName + '，确定吗？',
      callback: function () {
        $this.apiDelete(item);
      }
    });
  },

  btnLockClick: function(item) {
    var $this = this;

    utils.alertWarning({
      title: '锁定管理员',
      text: '此操作将锁定管理员 ' + item.userName + '，确定吗？',
      callback: function () {
        $this.apiLock(item);
      }
    });
  },

  btnUnLockClick: function(item) {
    var $this = this;

    utils.alertWarning({
      title: '解锁管理员',
      text: '此操作将解锁管理员 ' + item.userName + '，确定吗？',
      callback: function () {
        $this.apiUnLock(item);
      }
    });
  },

  btnSearchClick() {
    var $this = this;

    utils.loading(this, true);
    $api.get($url, {
      params: this.formInline
    }).then(function (response) {
      var res = response.data;

      $this.administrators = res.administrators;
      $this.count = res.count;
    }).catch(function (error) {
      utils.error($this, error);
    }).then(function () {
      utils.loading($this, false);
    });
  },

  btnExportClick: function() {
    utils.loading(this, true);
    $api.post($url + '/actions/export').then(function (response) {
      var res = response.data;

      window.open(res.value);
    }).catch(function (error) {
      utils.error($this, error);
    }).then(function () {
      utils.loading($this, false);
    });
  },

  handleCurrentChange: function(val) {
    this.formInline.currentValue = val;
    this.formInline.offset = this.formInline.limit * (val - 1);

    this.btnSearchClick();
  },

  btnAddClick: function () {
    location.href = utils.getSettingsUrl('administratorsProfile', {pageType: 'admin'});
  },

  btnImportClick: function() {
    this.uploadPanel = true;
  },

  uploadBefore(file) {
    var isExcel = file.name.indexOf('.xlsx', file.name.length - '.xlsx'.length) !== -1;
    if (!isExcel) {
      this.$message.error('管理员导入文件只能是 Excel 格式!');
    }
    return isExcel;
  },

  uploadProgress: function() {
    utils.loading(this, true);
  },

  uploadSuccess: function(res, file) {
    this.uploadPanel = false;

    var success = res.success;
    var failure = res.failure;
    var errorMessage = res.errorMessage;

    var $this = this;

    $api.get($url, {
      params: this.formInline
    }).then(function (response) {
      var res = response.data;

      $this.administrators = res.administrators;
      $this.count = res.count;
      $this.roles = res.roles;
      $this.isSuperAdmin = res.isSuperAdmin;
      $this.adminId = res.adminId;
    }).catch(function (error) {
      utils.error($this, error);
    }).then(function () {
      if (success) {
        $this.$message.success('成功导入 ' + success + ' 名管理员！');
      }
      if (errorMessage) {
        $this.$message.error(failure + ' 名管理员导入失败：' + errorMessage);
      }
      utils.loading($this, false);
    });
  },

  uploadError: function(err) {
    utils.loading(this, false);
    var error = JSON.parse(err.message);
    this.$message.error(error.message);
  }
};

var $vue = new Vue({
  el: '#main',
  data: data,
  methods: methods,
  created: function () {
    this.apiGet();
  }
});