# To-Do application in Knockout JS

We've already seen how easy it is to get stared with Knockout. But just like an image is worth a thousand of words, nothing can prove that a framework is useful than some example application using it. So, without further ado, let's make a simple To Do app with Knockout JS.

### Basic idea

As we want to touch a couple of thing and how it can be achieved in Knockout, we need to define what should be included in our app. It should consist of two main parts: an input for creating a new task, and a list of tasks. More specifically, we'd like to confirm adding a task by pressing Enter (no unnecessary _Submit_ buttons), and we also want to have the possibility to mask tasks as done and delete them from the list.

### HTML Template

First, we need to create a template and decide how our application will look like. This will serve as a base to our application, which later on can be enhanced with a bit of JS magic.

    <div class="app">
      <div class="item-edit">
        <input type="text" value="" placeholder="Add a task to do">
      </div>
      <div class="items-list">
        <div class="items-list-header">
          List of things to do
        </div>
        <!-- List of tasks -->
        <div class="item">
          <div class="item-done-button">
            <!-- toggle icon for done/not done tasks -->
            <i class="fa fa-check-square-o" aria-hidden="true"></i>
          </div>
          <div class="item-summary">Something to be done soon</div>
          <div class="item-delete-button">
            <i class="fa fa-trash" aria-hidden="true"></i>
          </div>
        </div>
      </div>
    </div>

### First steps

Let's start with creating a task property that will be bound to our input:

    // JS
    function Model() {
      this.task = ko.observable('');
    }

    // HTML
    <input type="text" value="" placeholder="Add a task to do" data-bind="value: task">

This is easy, but what about submitting a new task by pressing Enter? In order to do this we need to bind to a `keyUp` event and perform a save. For now, since we don't have a list of tasks yet, let's just console log it:

    // HTML
    <input type="text" value="" placeholder="Add a task to do" data-bind="value: task, event: { keyup: addTask }">

    // JS
    function Model() {
      ...
      this.addTask = function(model, event) {
          console.log(model.task());
      };
    }

As you can see, an event listener takes two arguments: first is our `Model` and second one is an event itself. If we test our code right now, we'll get a bit disappointed. When you start typing, you get `undefined` logged to the console. Why is that? Our `task` value is updated on _blur_. We can fix that with yet another bind, this time to `valueUpdate` property and set it to `input`:

    // HTML
    <input type="text" value="" placeholder="Add a task to do" data-bind="value: task, event: { keyup: addTask }, valueUpdate: 'input'">

One last thing we want here is perform our action only on pressing Enter key. We don't want to log our task on every keystroke, but just when we finish typing. To do that we need to utilize our second argument (`event`) and check for pressed key code. If the code equals 13 (Enter key), we can submit our task (or print it for now). We should probably also clear our input once it is _submitted_:

    // JS
    function Model() {
      ...
      this.addTask = function(model, e) {
          if (e.keyCode == 13) {
              console.log(model.task());
              model.task('');
          }
      };
    }

### Operations on collection items

Once we know how to create new tasks, we need to list them all. Our `Model` doesn't have an appropriate field yet, so we need to add it now, with some sample task alredy inserted:

    // JS
    function Model() {
      ...
      this.tasks = ko.observableArray([{ task: 'Something to be done soon', done: false }]);
    }

Then we should list those tasks somehow in HTML. If you saw [my previous post](http://mycodesmells.com/post/knockout-js-basics), you already know about `foreach` directive, but it requires you to create some parent container to your collection (eg. `<ul>` to a bunch of `<li>`'s'). Here, we want to skip this, so we need to use a directive in an HTML comment, so that no container is required. Inside our loop we'll use `task` property of each array item, so that an their contents are displayed:

    // HTML
    <!-- ko foreach: tasks -->
    <div class="item">
      <div class="item-done-button">
        <!-- toggle icon for done/not done tasks -->
        <i class="fa fa-check-square-o" aria-hidden="true"></i>
      </div>
      <div class="item-summary" data-bind="text: task"></div>
      <div class="item-delete-button">
        <i class="fa fa-trash" aria-hidden="true"></i>
      </div>
    </div>
    <!-- /ko -->

Here we should have two actions bound to each task - switching its status (_done_ <-> _not done_) and deleting them from the list. Both functions perform actions on Model object, but in this case (functions inside collection loop), we don't have our `Model` passed as an argument. So for these functions, we need to add `.bind(this)` at the end. Removing task can be done using `observableArray` function called... `remove` which takes an item of the array and updates the collection:

    // JS
    function Model() {
      ...
      this.removeTask = function(task) {
          this.tasks.remove(task);
      }.bind(this);
    }

Our second function is slightly more complicated, as we don't have any utility function for updating one of the items in the collection. Instead, we need to create a new list of tasks by mapping their items: one that was clicked on will be changes, while all the other stay the same:

    // JS
    function Model() {
      ...
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

If we are already performing actions on `tasks` array, we can as well update our `addTask` function to actually add a new task:

    // JS
    function Model() {
      ...
      this.addTask = function(model, e) {
          if (e.keyCode == 13) {
              model.tasks.push({ task: model.task(), done: false });
              model.task('');
          }
      };
      ...
    }

Now we need to bind those actions to our HTML template. If you have been paying attention before, we saw that within out loop, we don't have any iteration object - we access our item's properties just by their name (as if each item was a separate Model at the time). However, `removeTask` and `toggleDone` functions are defined outside each item, directly in our `Model` function. In order to call them, we need to access them via `$parent` object:

    // HTML
    <!-- ko foreach: tasks -->
    <div class="item">
      <div class="item-done-button" data-bind="click: $parent.toggleDone">
        <!-- toggle icon for done/not done tasks -->
        <i class="fa fa-check-square-o" aria-hidden="true"></i>
      </div>
      <div class="item-summary" data-bind="text: task"></div>
      <div class="item-delete-button" data-bind="click: $parent.removeTask">
        <i class="fa fa-trash" aria-hidden="true"></i>
      </div>
    </div>
    <!-- /ko -->

One last thing we'd like to have is make our icon (within `.item-done-button` div) to dispay different image for tasks that are done and those that are not. This part is relatively easy, as we can use another Knockout directive in a comment, this time it's a simple `if`:

    // HTML
    <div class="item-done-button" data-bind="click: $parent.toggleDone">
        <!-- ko if: done -->
          <i class="fa fa-repeat" aria-hidden="true"></i>
        <!-- /ko -->
        <!-- ko if: !done -->
          <i class="fa fa-check" aria-hidden="true"></i>
        <!-- /ko -->
    </div>

### Summary

As you can see, creating a simple application using Knockout JS is quite easy. Whenever you are facing such small task or project, you should consider using it instead of React, Angular, etc., as it doesn't require any additional dependencies.

This example can be found [on Github](https://github.com/mycodesmells/knockout-todo-example).
