import React, { Component } from 'react'
import { Tweet } from 'react-twitter-widgets'
import './App.css'

// This would not be hardcoded in production & client app would request token from backend auth service on a regular interval.
const TWITTER_APP_BEARER_TOKEN =
  'Bearer insert-bearer-token-here'

function TweetList(props) {
  if (props.tweets && props.tweets.length) {
    return props.tweets.map(tweet => (
      <li key={tweet.id_str}>
        <Tweet tweetId={tweet.id_str} />
      </li>
    ))
  } else {
    return <li>No results. Try a more general search term.</li>
  }
}

class Loading extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      text: 'Loading'
    }
  }
  componentDidMount() {
    const stopper = this.state.text + '...'
    this.interval = window.setInterval(() => {
      this.state.text === stopper
        ? this.setState(() => ({ text: 'Loading' }))
        : this.setState(prevState => ({ text: prevState.text + '.' }))
    }, 300)
  }
  componentWillUnmount() {
    window.clearInterval(this.interval)
  }
  render() {
    return <p>{this.state.text}</p>
  }
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      searchText: 'San Francisco',
      tweets: []
    }
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleInputChange(event) {
    const target = event.target
    const value = target.value
    const name = target.name

    this.setState({
      [name]: value
    })
  }

  handleSubmit(event) {
    event.preventDefault()
    this.searchTwitter()
  }

  searchTwitter() {
    this.setState({
      loading: true
    })
    const headers = new Headers()
    headers.append('Authorization', TWITTER_APP_BEARER_TOKEN)
    return fetch(`/api/1.1/search/tweets.json?q=${this.state.searchText}&result_type=popular&lang=en`, { headers })
      .then(data => {
        if (data.ok) {
          return data.json()
        } else {
          this.setState({ loading: false })
          console.warn(data)
        }
      })
      .then(results => {
        if (results) {
          this.setState(prevState => ({
            tweets: results.statuses,
            loading: false
          }))
        }
      })
      .catch(error => {
        this.setState({ loading: false })
        console.warn(error)
      })
  }

  componentDidMount() {
    this.searchTwitter()
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Twitter Search Demo</h1>
        </header>
        <div className="Search-form">
          <form onSubmit={this.handleSubmit}>
            <input type="text" name="searchText" value={this.state.searchText} onChange={this.handleInputChange} />
            <input type="submit" value="Search" />
          </form>
        </div>
        <ul className="Tweet-list">{this.state.loading ? <Loading /> : <TweetList tweets={this.state.tweets} />}</ul>
      </div>
    )
  }
}

export default App
