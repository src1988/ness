import React, { Component } from "react";
import ReactDOM from 'react-dom';
import apicalypse from 'apicalypse';
import {
    Stitch,
    AnonymousCredential,
    UserPasswordCredential,
    RemoteMongoClient
} from "mongodb-stitch-browser-sdk";
import "./App.css";
import { requestOptions, addGameDetails } from './consts.js';

class App extends Component {
    constructor() {
        super();
        this.state = {
            matches: [],
            gamename: '',
            gamesearches: [],
            imageUrl: '',
            showGameDetails: false
        };
        this.handleChange = this.handleChange.bind(this);
        this.displayMatches = this.displayMatches.bind(this);
        this.addMatch = this.addMatch.bind(this);
        this.findGame = this.findGame.bind(this);
        this.getGameDetails = this.getGameDetails.bind(this);  
    }
    componentDidMount() {
        // Initialize the App Client
        this.client = Stitch.initializeDefaultAppClient("nessgaming-iimaq");
        // Get a MongoDB Service Client
        // This is used for logging in and communicating with Stitch
        const mongodb = this.client.getServiceClient(
            RemoteMongoClient.factory,
            "nessgaming-atlas"
        );             

        // Get a reference to the main 'ness' database
        this.db = mongodb.db("ness");
        this.displayMatchesOnLoad();    
    }
    displayMatches() {
        // query the remote DB and update the component state
        this.db
            .collection("match")
            .find({}, { limit: 50 })
            .asArray()
            .then(matches => {
                this.setState({ matches });
            });
    }
    displayMatchesOnLoad() {
        // Check if real user
        const credential = new UserPasswordCredential("scott.r.caron@gmail.com", "VZTera2019!")
        this.client.auth.loginWithCredential(credential)
            // Returns a promise that resolves to the authenticated user
            .then(authedUser => {
                //console.log(`successfully logged in with id: ${authedUser.id}`);
                this.displayMatches();
            })
            .catch(err => console.error(`login failed with error: ${err}`))  
    }
    findGame(event) {
        event.preventDefault();
        const { gamename } = this.state;          

        (async () => {
            const response = await apicalypse(requestOptions)
                .fields("name")
                .search(gamename)
                .request("/games")
                .then(response => {
                    //console.log(response.data);
                    this.setState({gamesearches: response.data});
                })
        })();
    }    
    getGameDetails(event){
        console.log(event.target.id);

        (async () => {
            const response = await apicalypse(requestOptions)
                .fields("name, cover")
                .limit(50)                
                .where('id = '+event.target.id)
                .request("/games")
                .then(response => {
                    //console.log(response.data[0]);
                    (async () => {
                        const response2 = await apicalypse(requestOptions)
                            .fields("image_id")
                            .where('id = '+response.data[0].cover)
                            .request("/covers")
                            .then(response2 => {
                                console.log('https://images.igdb.com/igdb/image/upload/t_cover_big/'+response2.data[0].image_id+'.jpg');
                                this.setState({
                                    imageUrl:'https://images.igdb.com/igdb/image/upload/t_cover_big/'+response2.data[0].image_id+'.jpg',
                                    showGameDetails: true
                                });
                            })
                    })();
                })
        })();
    }    
    addMatch(event) {
        event.preventDefault();
        const { game, numofplayers } = this.state;
        // insert the match into the remote Stitch DB
        // then re-query the DB and display the new todos
        this.db
            .collection("match")
            .insertOne({
                owner_id: this.client.auth.user.id,
                game: game,
                numofplayers: numofplayers
            })
            .then(this.displayMatches)
            .catch(console.error);
    }
    handleChange(event) {
        if (event.target.name === 'gamename'){
            this.setState({ gamename: event.target.value.charAt(0).toUpperCase() + event.target.value.slice(1) });
        }
        else this.setState({ [event.target.name]: event.target.value });
    }
    render() {
        return (
            <div className="App">
                <div className="App-header">NessGaming</div>
                <div className="CreateMatch">
                    <p>Create a Match:</p>
                    <form onSubmit={this.findGame}>
                        <label>Search For Game:&nbsp;
                            <input
                                type="text"
                                name="gamename"
                                value={this.state.gamename}
                                onChange={this.handleChange}
                            />
                        </label>
                        <br/>
                        <input type="submit" value="Submit" />
                    </form>
                    <br/>
                    <div className="">
                        {this.state.gamesearches.map(gamesearch => {
                            return (
                                <React.Fragment key={gamesearch.id}>
                                    <button id={gamesearch.id} className="" onClick={this.getGameDetails}>Game: {gamesearch.name}</button>
                                    <br/>
                                </React.Fragment>
                            );
                        })}
                    </div>
                    <br/> 
                    { this.state.showGameDetails &&                   
                        <div className="AddMatchDetails" id="AddMatchDetails">
                            <div>
                                <img src={this.state.imageUrl} id="createGameImg" alt="Image URL" style={{width:'150px'}}/>
                            </div>
                            <div>
                                <form onSubmit={this.addMatch}>
                                    <label>Game:&nbsp;
                                        <input
                                            type="text"
                                            name="game"
                                            readOnly
                                            value={this.state.gamename}
                                        />
                                    </label>
                                    <br/>
                                    <label># of players:&nbsp;
                                        <input
                                            type="number"
                                            name="numofplayers"
                                            value={this.state.numofplayers}
                                            onChange={this.handleChange}
                                        />
                                    </label>
                                    <br/>
                                    <input type="submit" value="Submit" />
                                </form>
                            </div>
                        </div>
                    }
                    <div className="matches">
                        <h3>Active Matches</h3>
                        {this.state.matches.map(match => {
                            return <button className="match-item" key={match._id}>Game: {match.game}<br/>Owner: {this.client.auth.user.name}<br/># of Players: {match.numofplayers}</button>;
                        })}
                    </div>
                </div>
            </div>
        );
    }
}
export default App;
