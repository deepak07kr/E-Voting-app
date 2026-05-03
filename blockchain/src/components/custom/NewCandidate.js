import React, { Component } from 'react';
import Web3 from 'web3';
import Election from '../../build/Election.json';

class NewCandidate extends Component {

    constructor(props) {
        super(props);
        this.state = {
            account: '',
            election: null,
            candidate_name: '',
            candidate_details: '',
            id: null,
            loading: false
        };

        this.addCandidates = this.addCandidates.bind(this);
    }

    async componentDidMount() {
        await this.loadWeb3();
        await this.loadBlockChain();

        let id = this.props.match.params.id;
        this.setState({ id });
    }

    async loadWeb3() {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.request({ method: 'eth_requestAccounts' });
        }
        else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
        }
        else {
            window.alert('Non-Ethereum browser detected. Install MetaMask!');
        }
    }

   async loadBlockChain() {
    const web3 = window.web3;

    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });

    const networkId = String(await web3.eth.net.getId());
    const networkData = Election.networks[networkId];

    if (networkData && networkData.address) {
        const election = new web3.eth.Contract(
            Election.abi,
            networkData.address
        );
        this.setState({ election });
    } else {
        console.error("Network ID:", networkId);
        console.log("Election networks:", Election.networks);

        window.alert('Election contract not deployed to detected network.');
    }
}

    handleInputChange = (e) => {
        this.setState({
            [e.target.id]: e.target.value
        });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.addCandidates();
    }

    addCandidates() {

        if (!this.state.election) {
            alert("Blockchain not loaded yet. Please wait...");
            return;
        }

        this.setState({ loading: true });

        this.state.election.methods
            .addCandidate(
                this.state.candidate_name,
                this.state.candidate_details,
                this.state.id
            )
            .send({ from: this.state.account })
            .once('receipt', (receipt) => {
                console.log(receipt);
                this.setState({ loading: false });
                window.location.assign("/");
            });
    }

    render() {
        return (
            <div className="container">
                <form onSubmit={this.handleSubmit}>

                    <input
                        type="text"
                        id="candidate_name"
                        onChange={this.handleInputChange}
                        required
                    />
                    <label>Candidate Name</label>

                    <br /><br />

                    <input
                        type="text"
                        id="candidate_details"
                        onChange={this.handleInputChange}
                        required
                    />
                    <label>Candidate Details</label>

                    <br /><br />

                    <button
                        className="btn blue darken-2"
                        type="submit"
                    >
                        Submit
                        <i className="material-icons right">send</i>
                    </button>

                </form>
            </div>
        );
    }
}

export default NewCandidate;