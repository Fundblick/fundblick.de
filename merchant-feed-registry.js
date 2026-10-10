'use strict';
const path=require('node:path');

const merchants={
  sirui:{
    key:'sirui',merchant:'SIRUI DE',network:'awin',advertiserId:'128645',publisherId:'3106259',preferredFeedId:'F4133',artifactIdentityPath:'merchantVariantId',
    inputPattern:/SIRUI_128645_F4133_.*\.csv(?:\.gz)?$/i,normalizer:'./sirui-feed-normalizer.js',
    expected:{advertiserRows:923,products:923,inStock:498,rawFeedSha256:'e095b9d1a1c286cacb2d5e527003b22f16286dc7c07215d63354cda439751359'},
    catalogCategories:['lenses','tripods','tripod-heads','lighting','filters','accessories','optics'].map(s=>'electronics.photo.'+s)
  },

  deluxehomeart:{
    key:'deluxehomeart',merchant:'Deluxehomeartshop DE',network:'awin',advertiserId:'120411',publisherId:'3106259',preferredFeedId:'110455',
    inputPattern:/120411-110455-.*\.csv(?:\.gz)?$/i,normalizer:'./deluxehomeart-feed-normalizer.js',
    expected:{advertiserRows:592,products:592,rawFeedSha256:'82cf6bf9da23d59dd9dcb677ca7940da00d5ab7d83b2e76b2341c7df646ead76'},
    catalogCategories:['home.decor','home.lighting']
  },
  amazgifts:{
    key:'amazgifts',
    merchant:'Amazgifts DE',
    network:'awin',
    advertiserId:'87569',
    publisherId:'3106259',
    preferredFeedId:'95497',
    inputPattern:/datafeed_3106259.*\.csv(?:\.gz)?$/i,
    normalizer:'./amazgifts-feed-normalizer.js',
    expected:{products:2964,rawFeedSha256:'9dadbc32d81303f38a4d8a92520d9ac29abf5aea3ac8c10d89393e8fd43822bf',artifactSha256:'32ca063fc6d02a7ba6407175100e7da84f0c75731f097033b6096aff55b2d65a'},
    catalogCategories:['gifts.personalized.jewelry','gifts.personalized.keychains','gifts.personalized.photo-gifts','craft.jewelry-making.supplies','gifts.personalized.other']
  },
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
