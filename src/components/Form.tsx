import React, { ChangeEventHandler, Component } from 'react'
import { PieChart } from 'react-minimal-pie-chart';

interface formElement {
    value : number,
    text : string,
    type : string,
    formName : string,
    onChange : ChangeEventHandler<HTMLInputElement>
}

interface Entry {
    key : number,
    attempts : number,
    rand : number,
    target : number,
    isMatch : boolean,
}

interface IState {
    [key : string] : any,
    formElements: {
        min : formElement,
        max : formElement,
        target : formElement,
    },
    btnDisabled : boolean,
    showError : boolean,
    isRun : boolean,
    numNo : number,
    numYes : number,
    entries : Array<Entry>,
    interval : NodeJS.Timeout,
}

const RESET_ENTRIES = {
    numNo:0,
    numYes:0,
    entries: []
}

export default class Form extends Component<{}, IState> {

    public constructor(props: {}){
        super(props);
        this.state = {
            formElements : {
                min: {
                    value : NaN,
                    text : "Minimum: ",
                    type : "text",
                    formName : "min",
                    onChange : this.handleChange
                },
                max: {
                    value : NaN,
                    text : "Maximum: ",
                    type : "text",
                    formName : "max",
                    onChange : this.handleChange
                },
                target: {
                    value : NaN,
                    text : "Target: ",
                    type : "text",
                    formName : "target",
                    onChange : this.handleChange
                },
            },
            target: NaN,
            btnDisabled: true,
            showError: true,
            isRun: false,
            numNo: 0,
            numYes: 0,
            entries: [],
            interval: setInterval(()=>{}, 0),
        }
            
        this.handleChange = this.handleChange.bind(this);
        this.checkForEmptyFields = this.checkForEmptyFields.bind(this);
        this.generateFormElements = this.generateFormElements.bind(this);
    }

    private tick() {
        if(this.state.isRun){
            const rand = Math.floor(Math.random() * (this.state.formElements.max.value - this.state.formElements.min.value + 1) + this.state.formElements.min.value);
            const match = rand === this.state.formElements.target.value;
            const attempts = this.state.numNo + this.state.numYes;
            const newEntry = {key: this.state.entries.length, target: this.state.formElements.target.value, isMatch: match, attempts, rand,}

            if(match){
                this.setState({numYes: this.state.numYes+1, entries: [...this.state.entries, newEntry]})
            } else {
                this.setState({numNo: this.state.numNo+1, entries: [...this.state.entries, newEntry]})
            }
        }
    }

    public componentDidMount() {
        this.setState({interval : setInterval(() => this.tick(), 1000)});
    }

    public componentWillUnmount() {
        clearInterval(this.state.interval);
    }

    //called when a field is modified checks for empty fields and updates error and button accordingly
    private checkForEmptyFields = () => {
        if(isNaN(this.state.formElements.max.value) || isNaN(this.state.formElements.min.value) || isNaN(this.state.formElements.target.value)){
            this.setState({showError: true, btnDisabled: true, isRun: false, ...RESET_ENTRIES });
        } else {
            this.setState({showError: false, btnDisabled: false, isRun: false, ...RESET_ENTRIES});
        }
    }

    private handleChange = (event: any) => {
        const name = event.target.name as 'min' | 'max' | 'target'
        const value = +event.target.value
        let formData = this.state.formElements;

        //if user clears input set state
        //else if new value is a valid number set state
        //else its invalid then check if type a number is already persisting if not persist for 1500ms
        if (event.target.value === ""){
            formData[name].value = NaN;
            this.setState({ formElements : formData, showError: true, btnDisabled: true, isRun: false, ...RESET_ENTRIES });
        } else if(!isNaN(value)){
            formData[name].value = value;
            this.setState({ formElements : formData }, () => {
                this.checkForEmptyFields()
            });
        } else {
            //dont want to stop run if the input is invalid 
            if(!this.state.showError){
                this.setState({showError: true}, () => {
                    setTimeout(() => {
                        this.setState({showError: false})
                    }, 1500)
                })
            }
        }
    }

    private handleClick = () => {
        this.setState({btnDisabled: true, isRun: true});
    }

    private generateFormElements = () => {
        const allElements : any = [];
        for(const [key, data] of Object.entries(this.state.formElements)){
            allElements.push(<label key={key}>{data.text} <input type={data.type} name={data.formName} value={isNaN(data.value) ? "" : data.value} onChange={data.onChange} /></label>);
        }

        return allElements;
    }

    public render() {
        return (
            <div>
                <div>
                    {this.state.showError ? <span className="text-danger">Type a number</span> : ""}
                    <form>
                        {this.generateFormElements()}
                        <button onClick={this.handleClick} disabled={this.state.btnDisabled} className="btn">Run Target</button>
                    </form>
                </div>
                <hr/>
                {this.state.isRun ?
                <div className="container">
                    <div className="row">
                        <div className="col-6" >
                            <div style={{overflowY:"auto", height:"80vh"}}>
                                <table className="table table-striped table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Attempt#</th>
                                            <th>Current Random Number</th>
                                            <th>Target Number</th>
                                            <th>Is Match</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.entries.map((e)=>{
                                            return <tr key={e.key}><td>{e.attempts}</td><td>{e.rand}</td><td>{e.target}</td><td>{e.isMatch ? 'yes' : 'no'}</td></tr>;
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="col-6">
                            <PieChart
                                label={({ dataEntry }) => {
                                    if(dataEntry.value === 0)
                                        return "";
                                    return dataEntry.title + " " + dataEntry.value;
                                }}
                                data={[
                                    { label:'yes', title: 'Yes', value: this.state.numYes, color: '#6B8E23' },
                                    { label:'no', title: 'No', value: this.state.numNo, color: '#C13C37' },
                                ]}
                            />
                        </div>
                    </div>
                </div>
                :
                ""
                }

            </div>
        )
    }
}
