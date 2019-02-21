import React, { Component } from "react";
import apicalypse from 'apicalypse';
import {
    Stitch,
    AnonymousCredential,
    UserPasswordCredential,
    RemoteMongoClient
} from "mongodb-stitch-browser-sdk";
import "./App.css";

class App extends Component {
    constructor() {
        super();
        this.state = {
            matches: [],
            gamename: '',
            gamesearches: []
        };
        this.handleChange = this.handleChange.bind(this);
        this.displayMatches = this.displayMatches.bind(this);
        this.addMatch = this.addMatch.bind(this);
        this.findGame = this.findGame.bind(this);
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

        // Check if real user
        const credential = new UserPasswordCredential("scott.r.caron@gmail.com", "VZTera2019!")
        this.client.auth.loginWithCredential(credential)
            // Returns a promise that resolves to the authenticated user
            .then(authedUser => {
                console.log(`successfully logged in with id: ${authedUser.id}`);
                this.displayMatchesOnLoad();
            })
            .catch(err => console.error(`login failed with error: ${err}`))        
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
        // Anonymously log in and display comments on load
        this.client.auth
            .loginWithCredential(new AnonymousCredential())
            .then(this.displayMatches)
            .catch(console.error);
    }
    findGame(event) {
        event.preventDefault();
        const { gamename } = this.state;
        const requestOptions = {
            queryMethod: 'body',
            method: 'post',
            baseURL: 'https://cors-anywhere.herokuapp.com/https://api-v3.igdb.com',
            headers: {
                'user-key': 'b384d3c23f1d42a552d8c30f5e68464c',
                'Accept': 'application/json'
            },
            responseType: 'json',
            timeout: 20000,
        };  

        (async () => {
            const response = await apicalypse(requestOptions)
                .fields("name")
                .limit(50)                
                .search(gamename)
                //.where('id = 1905')
                .request("/games")
                .then(response => {
                    console.log(response.data);
                    console.log("Got here");
                    this.setState({gamesearches: response.data});
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
        this.setState({ [event.target.name]: event.target.value });
    }
    render() {
        return (
            <div className="App">
                <h3>NessGaming</h3>
                <hr />
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
                                    <button className="">Game: {gamesearch.name}</button>
                                    <br/>
                                </React.Fragment>
                            );
                        })}
                    </div>
                    <br/>
                    <form onSubmit={this.addMatch}>
                        <label>Game:&nbsp;
                            <input
                                type="text"
                                name="game"
                                value={this.state.game}
                                onChange={this.handleChange}
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
