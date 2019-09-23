const DataLoader = require("dataloader");
const sort = require("dataloader-sort").default;

const batchCollection = async (
  collection,
  collectionName,
  keys,
  additionalFilter
) => {
  let results = await collection(collectionName)
    .find({ _id: { $in: keys }, ...additionalFilter })
    .toArray();
  return sort(keys, results, "_id");
};

// ############################################################################################################
// ################################################################################################
// ####################################################################################
// ########################################################################

exports.createLoaders = collection => ({
  RiskInherentParameterRanks: new DataLoader(
    keys => batchCollection(collection, "RiskInherentParameterRanks", keys, {}),
    {
      cacheKeyFn: key => key.toString()
    }
  )
});

// ############################################################################################################
// ################################################################################################
// ####################################################################################
// ########################################################################

// exports.NOT_DELETED_DOCUMENT_QUERY = {
//     $or: [{ _deletedAt: null }, { _deletedAt: { $exists: false } }]
// };
exports.NOT_DELETED_DOCUMENT_QUERY = {
  _deletedAt: null,
  _deletedAt: { $exists: false }
};
