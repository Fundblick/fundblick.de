'use strict';
const assert=require('node:assert/strict');
const {inferFamily,classify}=require('./home-facet-classifier.js');
const {registry}=require('./taxonomy-registry.js');

const mower={name:'ANTHBOT Genie 800 Mähroboter 1500m² 4G',category:'home.garden.robot-mowers',rawAttributes:{productType:'Mähroboter'}};
assert.equal(inferFamily(mower),'robot-mowers');
assert.equal(classify(mower).type,'Mähroboter');
assert.equal(registry.families['robot-mowers'].types.includes(classify(mower).type),true);

const accessory={name:'ANTHBOT Garage Zubehör für Genie',category:'home.garden.robot-mower-accessories',rawAttributes:{productType:'Mähroboter-Zubehör'}};
assert.equal(inferFamily(accessory),'robot-mowers');
assert.equal(classify(accessory).type,'Mähroboter-Zubehör');
assert.equal(registry.families['robot-mowers'].types.includes(classify(accessory).type),true);

const categoryOnly={name:'ANTHBOT Ersatzteil',category:'home.garden.robot-mower-accessories',rawAttributes:{productType:'Mähroboter-Zubehör'}};
assert.equal(inferFamily(categoryOnly),'robot-mowers','canonical category must be enough to retain robot-mower family');
assert.equal(classify(categoryOnly).type,'Mähroboter-Zubehör','structured productType must drive accessory type');
console.log('Robot mower classifier gate passed');
