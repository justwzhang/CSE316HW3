import { React, useContext, useState } from "react";
import { GlobalStoreContext } from '../store'
/*
    This React component represents a single item in our
    Top 5 List, which can be edited or moved around.
    
    @author McKilla Gorilla
*/
function Top5Item(props) {
    const { store } = useContext(GlobalStoreContext);
    const [ draggedTo, setDraggedTo] = useState(0);
    const [ editActive, setEditActive ] = useState(false);
    const [ currentItemText, setItemText] = useState(store.currentList.items[props.index]);
    const [ oldItemText, setOldItemText] = useState(store.currentList.items[props.index]);

    function handleDragStart(event) {
        event.dataTransfer.setData("item", event.target.id);
    }

    function handleDragOver(event) {
        event.preventDefault();
    }

    function handleDragEnter(event) {
        event.preventDefault();
        setDraggedTo(true);
    }

    function handleDragLeave(event) {
        event.preventDefault();
        setDraggedTo(false);
    }

    function handleEditItem(event){
        store.setItemEditActive();
        event.preventDefault();
        let newActive = !editActive;
        setEditActive(newActive);
    }

    function handleKeyPress(event){
        if(event.code === "Enter"){
            if(oldItemText !== currentItemText){
                store.addChangeItemTransaction(props.index, oldItemText, currentItemText);
                setOldItemText(currentItemText);
            }
            let newActive = !editActive;
            setEditActive(newActive);
        }
    }

    function handleUpdateText(event){
        if(event.target.value.length !== 0){
            setItemText(event.target.value);
        }else{
            setItemText(" ");
        }
    }
    function handleDrop(event) {
        event.preventDefault();
        let target = event.target;
        let targetId = target.id;
        targetId = targetId.substring(target.id.indexOf("-") + 1);
        let sourceId = event.dataTransfer.getData("item");
        sourceId = sourceId.substring(sourceId.indexOf("-") + 1);
        setDraggedTo(false);

        // UPDATE THE LIST
        store.addMoveItemTransaction(sourceId, targetId);
    }

    let { index } = props;
    let itemClass = "top5-item";
    if (draggedTo) {
        itemClass = "top5-item-dragged-to";
    }
    let item =
    <div
            id={'item-' + (index + 1)}
            className={itemClass}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            draggable="true"
        >
            <input
                type="button"
                id={"edit-item-" + index + 1}
                className="list-card-button"
                onClick = {handleEditItem}
                value={"\u270E"}
            />
            {props.text}
        </div>; 
    if(editActive){
        item = 
        <input
                id={"item-" + (index + 1)}
                className = "top5-item"
                type='text'
                onKeyPress={handleKeyPress}
                onChange={handleUpdateText}
                defaultValue={currentItemText}
            />;
    }
    return item;
}

export default Top5Item;