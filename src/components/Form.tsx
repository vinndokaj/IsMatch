import React, { Component } from 'react'
import { PieChart } from 'react-minimal-pie-chart';

interface IState {
    min : number,
    max : number,
    target : number,
    btnDisabled : boolean,
    showError : boolean,
    isRun : boolean,
    numNo : number,
    numYes : number,
    entries : Array<JSX.Element>,
}

const RESET_ENTRIES = {
    numNo:0,
    numYes:0,
    entries: []
}

export default class Form extends Component<{}, IState> {
    //compiler auto generated this idk what the best wat to achieve this
    //with typescript is 
    interval!: NodeJS.Timeout;

    public constructor(props: {}){
        super(props);
        this.state = {
            min: NaN,
            max: NaN,
            target: NaN,
            btnDisabled: true,
            showError: true,
            isRun: false,
            numNo: 0,
            numYes: 0,
            entries: []
        }
            
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.checkForEmptyFields = this.checkForEmptyFields.bind(this);
    }

    tick() {
        if(this.state.isRun){
            const rand = Math.floor(Math.random() * (this.state.max - this.state.min + 1) + this.state.min);
            const match = rand === this.state.target;
            const attempts = this.state.numNo + this.state.numYes;
            const newEntry = <tr><td>{attempts}</td><td>{rand}</td><td>{this.state.target}</td><td>{match ? 'yes' : 'no'}</td></tr>;
            
            if(match){
                this.setState({numYes: this.state.numYes+1, entries: [...this.state.entries, newEntry]})
            } else {
                this.setState({numNo: this.state.numNo+1, entries: [...this.state.entries, newEntry]})
            }
        }
    }

    componentDidMount() {
        this.interval = setInterval(() => this.tick(), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    //called when a field is modified checks for empty fields and updates error and button accordingly
    private checkForEmptyFields = () => {
        if(isNaN(this.state.max) || isNaN(this.state.min) || isNaN(this.state.target)){
            this.setState({showError: true, btnDisabled: true, isRun: false, ...RESET_ENTRIES });
        } else {
            this.setState({showError: false, btnDisabled: false, isRun: false, ...RESET_ENTRIES});
        }
    }

    private handleChange = (event: any) => {
        //enums for this? output will always be min max or target but compiler doesnt like all 3
        const name = event.target.name as 'min' //| 'max' | 'target'
        const value = +event.target.value

        //if user clears input set state
        //else if new value is a valid number set state
        //else its invalid then check if type a number is already persisting if not persist for 1500ms
        if (event.target.value === ""){
            this.setState({ [name]: NaN, showError: true, btnDisabled: true, isRun: false, ...RESET_ENTRIES });
        } else if(!isNaN(value)){
            this.setState({ [name]: value}, () => {
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

    private handleSubmit = (e:any) => {
        e.preventDefault();
    }

    private handleClick = () => {
        this.setState({btnDisabled: true, isRun: true});
    }

    render() {
        return (
            <div>
                <div>
                    {this.state.showError ? <span>Type a number</span> : ""}
                    <form onSubmit={this.handleSubmit}>
                        Minimum: <input type="text" name="min" value={isNaN(this.state.min) ? "" : this.state.min} onChange={this.handleChange}/>
                        Maximum: <input type="text" name="max" value={isNaN(this.state.max) ? "" : this.state.max} onChange={this.handleChange}/>
                        Target: <input type="text" name="target" value={isNaN(this.state.target) ? "" : this.state.target} onChange={this.handleChange}/>
                        <button onClick={this.handleClick} disabled={this.state.btnDisabled}>Run Target</button>
                    </form>
                </div>
                <hr/>
                {this.state.isRun ?
                <div style={{display: 'flex'}}>
                    <table>
                        <thead>
                            <tr>
                                <th>Attempt#</th>
                                <th>Current Random Number</th>
                                <th>Target Number</th>
                                <th>Is Match</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.entries}
                        </tbody>
                    </table>
                    <PieChart
                        label={({ dataEntry }) => dataEntry.title}
                        data={[
                            { label:'yes', title: 'Yes', value: this.state.numYes, color: '#6B8E23' },
                            { label:'no', title: 'No', value: this.state.numNo, color: '#C13C37' },
                        ]}
                    />
                </div>
                :
                ""
                }

            </div>
        )
    }
}
