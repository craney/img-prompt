const { getDictionary } = require('./src/lib/get-dictionary.ts');

async function test() {
  try {
    const dict = await getDictionary('en');
    console.log('EN dict loaded:', !!dict);
    console.log('imageToPrompt exists:', !!dict.imageToPrompt);
    if (dict.imageToPrompt) {
      console.log('meta exists:', !!dict.imageToPrompt.meta);
      if (dict.imageToPrompt.meta) {
        console.log('title:', dict.imageToPrompt.meta.title);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

test();