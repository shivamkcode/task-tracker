/* eslint-disable react/prop-types */
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Button from "./Button";
import { useEffect, useState } from "react";
import Card from "./Card";
import Dots from "../assets/icon-vertical-ellipsis.svg";
import Checkbox from "./Checkbox";
import TaskForm from "./TaskForm";
import DeleteConfirm from "./DeleteConfirm";
import BoardForm from "./BoardForm";

// eslint-disable-next-line react/prop-types
const Board = ({
  boardId,
  boards,
  selectedColumns,
  boardName,
  isOpen,
  setIsOpen,
  getBoards,
  setChosenBoardId,
}) => {
  const [taskDetails, setTaskDetails] = useState(false);
  const [showTaskEditOption, setShowTaskEditOption] = useState(false);
  const [showTaskEditForm, setShowTaskEditForm] = useState(false);
  const [showTaskDeleteForm, setShowTaskDeleteForm] = useState(false);
  const [tasks, setTasks] = useState(
    boards.find((board) => board.id === boardId)?.tasks || []
  );
  const [selectedTask, setSelectedTask] = useState();

  const updateTask = async (id, title, description, status, subTasks) => {
    const response = await fetch(`http://localhost:3000/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, description, status, subTasks }),
    });
    if (response.ok) {
      const task = await response.json();
      console.log("Task updated:", task);
    } else {
      console.log("Error updating task:", response.status);
    }
  };

  const updateTaskDetails = async () => {
    await updateTask(
      selectedTask.id,
      selectedTask.title,
      selectedTask.description,
      selectedTask.status,
      selectedTask.subtasks
    );

    const _tasks = tasks.filter((task) => task.id !== selectedTask.id);
    const newTask = tasks.find((task) => task.id === selectedTask.id);
    if (newTask) {
      newTask.title = selectedTask.title;
      newTask.description = selectedTask.description;
      newTask.status = selectedTask.status;
      newTask.subtasks = newTask.subtasks.map((subtask) => ({
        ...subtask,
        completed: selectedTask.subtasks.find((st) => st.id === subtask.id)
          .completed,
      }));

      setTasks([..._tasks, newTask]);
      setSelectedTask({});
    }
  };

  const handleDragEnd = async (result) => {
    const { destination, draggableId } = result;
    if (!destination) {
      return;
    }

    // Find the task that was dragged and the column it was dragged to
    const draggedTask = tasks.find((task) => task.id === parseInt(draggableId));
    const newColumn = selectedColumns.find(
      (col) => col.id === parseInt(destination.droppableId)
    );

    if (draggedTask && newColumn) {
      // Update the status of the dragged task
      draggedTask.status = newColumn.status;

      // Remove the dragged task from its original position in the tasks array
      const newTasks = tasks.filter((task) => task.id !== draggedTask.id);

      // Insert the dragged task at its new position in the tasks array
      newTasks.splice(destination.index, 0, draggedTask);

      setTasks(newTasks);

      // Update the task in the backend
      await updateTask(
        draggedTask.id,
        draggedTask.title,
        draggedTask.description,
        draggedTask.status,
        draggedTask.subtasks
      );
    }
  };

  useEffect(() => {
    setTasks(boards.find((board) => board.id === boardId)?.tasks || []);
  }, [boardId, boards]);

  return (
    <div className="board">
      {selectedColumns.length > 0 && (
        <div className="column-container">
          <DragDropContext onDragEnd={handleDragEnd}>
            {selectedColumns
              ?.sort((a, b) => a.id - b.id)
              .map((column) => (
                <Droppable droppableId={column.id.toString()} key={column.id}>
                  {(provided) => (
                    <div
                      className="columns"
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      <div className="column-status">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="15"
                          height="15"
                          viewBox="0 0 15 15"
                          fill="none"
                        >
                          <circle
                            cx="7.5"
                            cy="7.5"
                            r="7.5"
                            fill={
                              column.status === "TODO"
                                ? "#49C4E5"
                                : column.status === "DOING"
                                ? "#8471F2"
                                : column.status === "DONE"
                                ? "#67E2AE"
                                : "#49C4E5"
                            }
                          />
                        </svg>
                        <h6>{column.status}</h6>
                      </div>
                      {tasks
                        .filter((task) => task.status === column.status)
                        .map((task, index) => (
                          <Draggable
                            draggableId={task.id.toString()}
                            index={index}
                            key={task.id}
                          >
                            {(provided) => (
                              <>
                                <div
                                  onClick={() => {
                                    setTaskDetails(true);
                                    setSelectedTask(task);
                                  }}
                                  className="task-box"
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  ref={provided.innerRef}
                                >
                                  <h3>{task.title}</h3>
                                  <span>
                                    {
                                      task.subtasks.filter(
                                        (subtask) => subtask.completed
                                      ).length
                                    }{" "}
                                    of {task.subtasks.length} subtasks
                                  </span>
                                </div>
                                {taskDetails && selectedTask.id === task.id && (
                                  <Card showShadow={true}>
                                    <div className="task-details">
                                      <div className="card-header">
                                        <h3>{task.title}</h3>
                                        <img
                                          onClick={() =>
                                            setShowTaskEditOption(
                                              !showTaskEditOption
                                            )
                                          }
                                          src={Dots}
                                          alt="dots"
                                        />
                                      </div>
                                      {showTaskEditOption && (
                                        <div className="edit-option">
                                          <span
                                            onClick={() => {
                                              setTaskDetails(false);
                                              setShowTaskEditOption(false);
                                              setShowTaskEditForm(true);
                                            }}
                                          >
                                            Edit Task
                                          </span>

                                          <span
                                            onClick={() => {
                                              setShowTaskEditOption(false);
                                              setTaskDetails(false);
                                              setShowTaskDeleteForm(true);
                                            }}
                                            style={{ color: "red" }}
                                          >
                                            Delete Task
                                          </span>

                                          <span
                                            onClick={() => {
                                              setTaskDetails(false);
                                              setShowTaskEditOption(
                                                !showTaskEditOption
                                              );
                                            }}
                                          >
                                            Close
                                          </span>
                                        </div>
                                      )}
                                      <p>{task.description}</p>
                                      <h6>
                                        Subtasks(
                                        {
                                          task.subtasks.filter(
                                            (subtask) => subtask.completed
                                          ).length
                                        }{" "}
                                        of {task.subtasks.length})
                                      </h6>
                                      {selectedTask.subtasks.map(
                                        (subtask, i) => (
                                          <Checkbox
                                            key={i}
                                            initialChecked={subtask.completed}
                                            onCheckboxChange={() => {
                                              const updatedSubtasks =
                                                selectedTask.subtasks.map(
                                                  (st) => {
                                                    if (st === subtask) {
                                                      return {
                                                        ...st,
                                                        completed:
                                                          !st.completed,
                                                      };
                                                    } else {
                                                      return st;
                                                    }
                                                  }
                                                );

                                              setSelectedTask({
                                                ...selectedTask,
                                                subtasks: updatedSubtasks,
                                              });
                                            }}
                                          >
                                            {subtask.title}
                                          </Checkbox>
                                        )
                                      )}
                                      <h6>Current Status</h6>
                                      <select
                                        name="Status"
                                        value={selectedTask.status}
                                        onChange={(e) =>
                                          setSelectedTask({
                                            ...selectedTask,
                                            status: e.target.value,
                                          })
                                        }
                                        required
                                      >
                                        {selectedColumns.map((column) => {
                                          return (
                                            <option
                                              key={column.id}
                                              value={column.status}
                                            >
                                              {column.status}
                                            </option>
                                          );
                                        })}
                                      </select>
                                      <Button onClick={updateTaskDetails}>
                                        Submit Changes
                                      </Button>
                                    </div>
                                  </Card>
                                )}
                              </>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
          </DragDropContext>
        </div>
      )}
      {isOpen.addBoard && (
        <BoardForm showForm={() => setIsOpen({ addBoard: false })} />
      )}
      {selectedColumns.length === 0 && (
        <div className="empty-board">
          <p>
            This board is empty. Create a new column to get started. Go to edit
            board to add a new column.
          </p>
        </div>
      )}
      {isOpen.showTaskForm && (
        <TaskForm
          selectedColumns={selectedColumns}
          getBoards={getBoards}
          boardId={boardId}
          mode=""
          showForm={() => setIsOpen({ showTaskForm: false })}
        />
      )}
      {showTaskEditForm && (
        <TaskForm
          updateTask={updateTask}
          showForm={setShowTaskEditForm}
          boardId={boardId}
          getBoards={getBoards}
          mode="edit"
          selectedTask={selectedTask}
          id={selectedTask.id}
          selectedColumns={selectedColumns}
        />
      )}
      {showTaskDeleteForm && (
        <DeleteConfirm
          text="task"
          getBoards={getBoards}
          name={selectedTask.title}
          id={selectedTask.id}
          hideForm={() => {
            setTaskDetails(false);
            setShowTaskDeleteForm(false);
          }}
        />
      )}
      {isOpen.editBoardForm && (
        <BoardForm
          selectedBoard={boards?.find((board) => board.id === boardId)}
          mode="edit"
          showForm={() => setIsOpen({ editBoardForm: false })}
          getBoards={getBoards}
        />
      )}
      {isOpen.deleteBoardForm && (
        <DeleteConfirm
          text="board"
          name={boardName}
          setChosenBoardId={setChosenBoardId}
          id={boardId}
          getBoards={getBoards}
          hideForm={() => setIsOpen({ deleteBoardForm: false })}
        />
      )}
      {isOpen.showEditBoard && (
        <div className="edit-option">
          <span onClick={() => setIsOpen({ editBoardForm: true })}>
            Edit Board
          </span>
          <span
            onClick={() => setIsOpen({ deleteBoardForm: true })}
            style={{ color: "red" }}
          >
            Delete Board
          </span>
        </div>
      )}
    </div>
  );
};

export default Board;
