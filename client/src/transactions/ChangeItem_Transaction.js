import  jsTPS_Transaction  from "../common/jsTPS.js";

export default class ChangeItem_Transaction extends jsTPS_Transaction{
    constructor(store, initIndex, initOldText, initNewText) {
        super();
        this.store = store;
        this.index = initIndex;
        this.oldText = initOldText;
        this.newText = initNewText;
    }

    doTransaction() {
        this.store.changeItemName(this.index, this.newText);
    }
    
    undoTransaction() {
        this.store.changeItemName(this.index, this.oldText);
    }

}