import Alt = require("alt");

export default class AbstractActions implements AltJS.ActionsClass {
    constructor(alt:AltJS.Alt) { }
    generateActions: (...actions: string[]) => any
    dispatch: ( ...payload:Array<any>) => void
}
