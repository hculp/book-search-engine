import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  setContext,
} from "@apollo/client";

import Navbar from "./components/Navbar";
import SearchBooks from "./pages/SearchBooks";
import SavedBooks from "./pages/SavedBooks";

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("id_token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat("/graphql"),
  uri: "/graphql",
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <Navbar />
        <Switch>
          <Route exact path="/" cinponent={SearchBooks} />
          <Route exact path="/saved" component={SavedBooks} />
          <Route exact path="/search" component={SearchBooks} />
        </Switch>
      </Router>
    </ApolloProvider>
  );
}

export default App;
