App = {
    contracts: {}, 
    todoList: {},
    load: async () => {
        await App.loadWeb3();
        await App.laodAccount();
        await App.loadContract();
        await App.render();
    },

  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  loadWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      window.alert("Please connect to Metamask.")
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        // Request account access if needed
        await ethereum.enable()
        // Acccounts now exposed
        web3.eth.sendTransaction({/* ... */})
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */})
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  },

  laodAccount: async () => {
    App.account = web3.eth.accounts[0];
    console.log(App.account);
  }, 
  loadContract: async () => {
      const todoList = await $.getJSON("TodoList.json");
      App.contracts.TodoList = TruffleContract(todoList);
      App.contracts.TodoList.setProvider(App.web3Provider);

      // Hydarate te smart contract with values from the blockchain
      App.todoList = await App.contracts.TodoList.deployed();
      var taskCount = await App.todoList.taskCount();
      console.log(taskCount.toNumber());
  }, 

  renderTasks: async () => {
    // load the total task count from the blockchain 
    let taskCount =await App.todoList.taskCount()
    taskCount = taskCount.toNumber();
    const $taskTemplate = $('.taskTemplate');

    // render out each ask with a new task template
    for(var i = 1; i <= taskCount; i++) {
        const task = await App.todoList.tasks(i);
        const taskId = task[0].toNumber();
        const taskContent = task[1];
        const taskConpleted = task[2];

        // create the html for the task
        const $newTaskTemplate = $taskTemplate.clone();
        $newTaskTemplate.find('.content').html(taskContent);
        $newTaskTemplate.find('input')
            .prop('name', taskId)
            .prop('checked', taskConpleted)
            .on('click', App.toggleComplete);
        if(taskConpleted) { 
            $('#completedTaskList').append($newTaskTemplate);
        }
        else {
            $('#taskList').append($newTaskTemplate);
        }

        $($newTaskTemplate).show(); 
    }


    // show the task
  }, 

  setLoading: (boolean) => {
    App.loading = boolean;
    const loader = $('#loader');
    const content = $('#content');
    if(boolean) {
        loader.show();
        content.hide();
    }
    else {
        loader.hide(); content.show();
    }
  },
  render: async () => {
    // prevent double render
    if(App.loading) return;

    // update app loading state
    App.setLoading(true);

    $('#account').html('Account: ' + App.account);
    await App.renderTasks();

    // Update loading state
    App.setLoading(false);
  }, 

}

$(
    function() {
        App.load();
    }
)