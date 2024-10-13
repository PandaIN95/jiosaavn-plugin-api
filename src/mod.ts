import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { JioSaavnAPI } from "./main.ts";

const app = new Hono()

app.use('*', cors())
app.use('*', logger())
app.use('*', prettyJSON())

app.get('/', (c) => {
  return c.text('Hello Hono!')
})
const api = new JioSaavnAPI()

app.get('/search', async (c) => {
  const query = c.req.query('q')
  if (!query) return c.json({ error: 'Missing query' })
  const results = await api.search(encodeURIComponent(query))
  return c.json(results)
})

app.get('/track', async (c) => {
  const url = c.req.query('url')
  const trackID = c.req.query('id')
  if (trackID) {
    const track = await api.getTrackById(trackID)
    return c.json(track)
  }
  if (!url) return c.json({ error: 'Missing URL' })
  const id = api.extract.track(url)
  if (!id) return c.json({ error: 'Invalid URL' })
  const track = await api.getTrack(id)
  return c.json(track)
})

app.get('/album', async (c) => {
  const url = c.req.query('url')
  if (!url) return c.json({ error: 'Missing URL' })
  const id = api.extract.album(url)
  if (!id) return c.json({ error: 'Invalid URL' })
  const album = await api.getAlbum(id)
  return c.json(album)
})

app.get('/artist', async (c) => {
  const url = c.req.query('url')
  if (!url) return c.json({ error: 'Missing URL' })
  const id = api.extract.artist(url)
  if (!id) return c.json({ error: 'Invalid URL' })
  const artist = await api.getArtist(id)
  return c.json(artist)
})

app.get('/playlist', async (c) => {
  const url = c.req.query('url')
  const limit = Number(c.req.query('limit')) || 100
  if (!url) return c.json({ error: 'Missing URL' })
  const id = api.extract.playlist(url)
  if (!id) return c.json({ error: 'Invalid URL' })
  const playlist = await api.getPlaylist(id, limit)
  return c.json(playlist)
})

app.get('/recommendations', async (c) => {
  const id = c.req.query('id')
  const limit = Number(c.req.query('limit')) || 10
  if (!id) return c.json({ error: 'Missing ' })
  const recommendations = await api.getRecommendations(id, limit)
  return c.json(recommendations)
})


Deno.serve(app.fetch)
