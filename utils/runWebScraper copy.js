// use chatGPT or StackOverflow for this
// this is just a simple web scraper using pupeteer

const puppeteer = require('puppeteer')
// import screenshot from '../screenshot.js'

const PROD_CONFIG = {
  headless: true,
  ignoreHTTPSErrors: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  ignoreDefaultArgs: ['--disable-extensions'],
}

// this is for my computer, you will have to change this to your own path or just not use it on your computer
const DEV_CONFIG = {
    executablePath:
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Path to Chrome on Windows
    headless: false,
    ignoreHTTPSErrors: true,
  };
  

const runWebScraper = async (url) => {
  const browser = await puppeteer.launch(
    process.env.NODE_ENV === 'production' ? PROD_CONFIG : DEV_CONFIG
  )

  console.time('puppeteer')

  const page = await browser.newPage()

  await page.goto(url, { waitUntil: 'domcontentloaded' })
  // await page.goto(url, { waitUntil: 'networkidle0' })

  const content = await page.$eval('*', (el) => {
    const selection = window.getSelection()
    const range = document.createRange()
    range.selectNode(el)
    selection.removeAllRanges()
    selection.addRange(range)
    return window.getSelection().toString()
  })

  // console.log(content)
  // console.log('content length: ', content.length)

  await page.close()

  await browser.close()

  console.timeEnd('puppeteer')

  return { text: content, url_from_chunk: url }
}

// FOR TESTING
// const URL = 'https://www.npmjs.com/package/html-to-text'
// runWebScraper(URL)

module.exports = { runWebScraper }