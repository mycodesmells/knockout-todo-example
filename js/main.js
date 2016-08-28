function Model() {
  this.newSummary = ko.observable();
  this.tasks = ko.observableArray([
    { summary: 'Something to do', done: false },
    { summary: 'Something already done', done: true }
  ]);

  this.addTask = function(task, e) {
      if (e.keyCode == 13) {
          this.tasks.push({ summary: this.newSummary(), done: false });
          this.newSummary('');
      }
  }.bind(this);

  this.toggleDone = function(task) {
      var index = this.tasks().indexOf(task);
      var updatedTasks = this.tasks().map(function(t, tIndex) {
          if (tIndex === index) {
              return {
                  done: !t.done,
                  summary: t.summary
              }
          } else {
              return t;
          }
      });
      this.tasks(updatedTasks);
  }.bind(this);

  this.removeTask = function(task) {
      console.log('removeTask');
      this.tasks.remove(task);
  }.bind(this);
}

ko.applyBindings(new Model());
