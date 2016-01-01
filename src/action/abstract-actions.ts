import Alt = require("alt");

export default class AbstractActions implements AltJS.ActionsClass {
    constructor(alt:AltJS.Alt){}
    dispatch: ( ...payload:Array<any>) => void;
}
