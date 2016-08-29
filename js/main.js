function Model() {
  this.task = ko.observable();
  this.addTask = function(model, e) {
      if (e.keyCode == 13) {
          model.tasks.push({ task: model.task(), done: false });
          model.task('');
      }
  };

  this.tasks = ko.observableArray([
      { task: 'Something to do', done: false },
      { task: 'Something already done', done: true }
  ]);
  this.removeTask = function(task) {
      this.tasks.remove(task);
  }.bind(this);
  this.toggleDone = function(task) {
    var index = this.tasks().indexOf(task);
    var updatedTasks = this.tasks().map(function(t, tIndex) {
      if (tIndex === index) {
        return {
          done: !t.done,
          task: t.task
        }
      } else {
        return t;
      }
    });
    this.tasks(updatedTasks);
  }.bind(this);
}

ko.applyBindings(new Model());
