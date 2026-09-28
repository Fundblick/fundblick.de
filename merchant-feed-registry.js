'use strict';
const path=require('node:path');

const merchants={
  anthbot:{
    key:'anthbot',
    merchant:'ANTHBOT DE',
    network:'awin',
    advertiserId:'125144',
    inputPattern:/125144.*retail.*\.csv(?:\.gz)?$/i,
    normalizer:'./anthbot-feed-normalizer.js',
    expected:{advertiserRows:161,products:56,inStock:34},
    catalogCategories:['home.garden.robot-mowers','home.garden.robot-mower-accessories']
  }
};

function getMerchant(key){
  const merchant=merchants[String(key||'').toLowerCase()];
  if(!merchant)throw new Error(`Unknown merchant feed key: ${key}`);
  return merchant;
}

function assertInput(config,input){
  const base=path.basename(String(input||''));
  if(!config.inputPattern.test(base))throw new Error(`${config.key}: unexpected feed filename ${base}`);
}

module.exports={merchants,getMerchant,assertInput};
