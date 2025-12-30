import style from './Kanban.module.css';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function KanbanBoard({ columns, glowColumn, onDragEnd, onCardDoubleClick, status_labels }) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className={style.kanban}>
        {Object.entries(columns).map(([status, items]) => (
          <Droppable droppableId={status} key={status}>
            {provided => (
              <div
                className={`${style.column} ${glowColumn === status ? style.columnGlow : ''}`}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <h2 className={style.columnTitle}>
                  {status_labels[status]} ({items.length})
                </h2>

                {items.map((ticket, index) => (
                  <Draggable
                    key={ticket.id}
                    draggableId={String(ticket.id)}
                    index={index}
                  >
                    {provided => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`${style.card} ${style[status]}`}
                        onDoubleClick={() => onCardDoubleClick(ticket)}
                      >
                        <strong>{ticket.rma}</strong>
                        <p>{ticket.customer?.name}</p>
                        <p className={style.product}>{ticket.product?.name}</p>
                        <p>Warranty: {ticket.warranty ? 'Yes' : 'No'}</p>
                        <p>Issue: {ticket.issue}</p>
                      </div>
                    )}
                  </Draggable>
                ))}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}