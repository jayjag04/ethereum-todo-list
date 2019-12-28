pragma solidity ^0.5.0;

contract TodoList {
    uint public taskCount = 0;
    struct Task {
        uint id;
        string content;
        bool completed;
    }
    mapping(uint => Task) public tasks;

    function createTask(string memory _content) public {
        taskCount++;
        Task memory _task = Task(taskCount, _content, false);
        tasks[taskCount] = _task;
    }

    constructor() public {
        createTask('Check out DappUniversity.com');
    }
}