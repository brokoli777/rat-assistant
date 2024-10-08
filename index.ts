#!/usr/bin/env bun

//test

import yargs from "yargs";
import {appendFile } from 'fs';
import {OpenAI} from 'openai'; 
import { stderr } from "bun";

const {name, version} = require("./package.json");
//test

const groqAPIKEY:string = process.env?.APIKEY ? process.env.APIKEY : "";
const requireAPIKey:boolean = !!(groqAPIKEY);
const gorg:string = "https://api.groq.com/openai/v1";
const langModel:string = "llama3-8b-8192";

export async function getGroqChatCompletion(prompt:string, model:string = langModel, argapiKey:string =groqAPIKEY, urlThing:string =gorg): Promise<any> {
  //hypotehtically can translate to any language (next thing) but
  //new idea code obfuscation
  //want to do something else but this is what i thought of 
  // const 
  const client = new OpenAI({
    apiKey: argapiKey,
    baseURL: urlThing
  });
  const thing = await client.chat.completions.create(
{
  model,
  messages:[
    {
      role:"user", //could be change problably
      content:prompt
    }
  ]

  
}
  )
    return {
      content: thing.choices[0]?.message?.content,
      tokenInfo: thing.usage
    };
  }
//deal with argument stuff

const languageTranslation = async(things : string, rat : string,  model:string = langModel, apiKey:string =groqAPIKEY, urlThing:string =gorg) =>{
//read the file of thing
//shoot off error if not
//alternative is a rubbery ducky but idk
//other idea is for it to explain how the things are connected together

  try{
    const foo = Bun.file(things);
    const text = await foo.text();
    const prompt:string = `Can you explain in a rat persona the general idea on how to ${rat} but not directly give the answer: ${text}`;
    return await getGroqChatCompletion(prompt, model, apiKey, urlThing);
  }catch(err)
  {console.error(`Error: ${err}`);
  throw err;
}

  // return things;
}
// const doThingToEach = (x) => console.log('🎵 Oy oy oy');
const argv = await yargs(Bun.argv.slice(2)).
usage('Usage: $0 <command> [...flags] [...ar  gs]').
example(`${name} index.js`, 'uses the language model to improve it').
scriptName(name).
command('$0 <files...>', 'parses one to many files', (yargs) =>{
  yargs
    .positional('files', {
      describe: 'path to file that it will parse',
      type: 'string',
    
      array: true, 
      demandOption:true
    });
}, async (argv) => {
  if(Array.isArray(argv.files)){
    // if(argv?.o){ vs typeof argv?.o = 'string' idk
    for(const file of argv.files){
      const m: string = typeof argv.m =='string' ? argv.m : langModel;
      const e: string = typeof argv.e =='string' ? argv.e : gorg;
      const k: string = typeof argv.k =='string' ? argv.k : groqAPIKEY;
      try{
        //idk why it needs all these guards when im telling it what the type of the things are
        //it thinks its unknown but
        if(typeof argv.r === 'string'){
          //a check to make sure it works

          const {content, tokenInfo} = await languageTranslation(file, argv.r, m, k,e);
         
          if(typeof argv.o === 'string'){
         //a check but also it kind of checks if its exists or not cause otherwise it's unknown 
            if(typeof argv.a === 'boolean'){
                appendFile(argv.o, content, err =>{
                  if(err)
                    throw err;
                })
            }
            else{
              await Bun.write(argv.o, content);
            }
            //bun can't append to files even though they have this
          }
          else{
            //if they're not writing to file
            console.log(content);
          }

          if(typeof argv.t === 'boolean'){

            await Bun.write(Bun.stderr, "\nToken Usage Information:\n" + "\n- Tokens Used for Prompt: " + tokenInfo.prompt_tokens + "\n- Response Tokens: " + tokenInfo.completion_tokens + "\n- Total Tokens: " + tokenInfo.total_tokens);
           
        }
        
      }
    }
      catch(err){
        console.error(`Failed to process file: ${file} \n`, err)
      }
      
    }
  }
})
.option('k',
  {
    alias: 'api-key',
    demandOption:requireAPIKey,
    default: groqAPIKEY,
    describe: "the apikey of the api endpoint your using",
    type: "string"
  }
)
.option('e',
  {
    alias: 'end-point',
    demandOption:false,
    default: gorg,
    describe: "api end point of the llm",
    type: "string"
  }
)
.option('m',
  {
    alias: 'model',
    demandOption:false,
    default: langModel,
    describe: "language model to use",
    type: "string"
  }
).
option('r', {
  alias: 'rubber-ratty',
  demandOption:true,
  describe: "What you want the ducky to explain",
  type: "string"
}).
option('o', {
  alias: 'output',
  describe: "file to output to",
  type: "string"
}).
option('a', {
  alias: 'append',
  default: "false",
  describe: "whether it destructively writes to file or appends to",
  type: "boolean"
}).
option('t', {
  alias: 'token-usage',
  default: "false",
  describe: "provides the token usage information",
  type: "boolean"
}).
version('v', 'version showing', version).
help('h', "shows the commands").
alias('h', 'help').
alias('v', 'version').
parse();
