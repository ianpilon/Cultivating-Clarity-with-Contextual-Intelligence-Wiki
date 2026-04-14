import WikiChat from './src/components/WikiChat'

export default {
  logo: <span style={{ fontWeight: 'bold' }}>Cultivating Clarity</span>,
  project: {
    link: 'https://github.com/ianpilon/Create-Modern-Documentation-Sites'
  },
  docsRepositoryBase: 'https://github.com/ianpilon/Create-Modern-Documentation-Sites/tree/main',
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Cultivating Clarity'
    }
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="Cultivating Clarity: The Art of Discerning What Matters Using Contextual Intelligence — A comprehensive knowledge base by Ian Timotheos Pilon" />
    </>
  ),
  navigation: {
    prev: true,
    next: true
  },
  footer: {
    text: 'Cultivating Clarity — Ian Timotheos Pilon ' + new Date().getFullYear()
  },
  sidebar: {
    defaultMenuCollapseLevel: 1,
    toggleButton: true
  },
  toc: {
    float: true,
    title: 'On This Page',
    extraContent: <WikiChat />,
  }
}
