const CuratedList = require("../models/CuratedList");

const createSlug = (name) => {
  return name.toLowerCase().split(" ").join("-");
};

//This function creates a new curated list.
const createCuratedList = async (req, res) => {
  try {
    let { name, slug, description } = req.body;

    if (!name || !description) {
      return res
        .status(400)
        .json({ error: "name or description not provided." });
    }

    if (!slug) {
      slug = createSlug(name);
    }

    const curatedList = await CuratedList.create({ name, slug, description });

    res
      .status(201)
      .json({ message: "Curated list created successfully.", curatedList });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create curated lists." });
  }
};

//This functions update name and description in a curated list object.
const updateNameAndDescription = async (req, res) => {
  try {
    const curatedListId = parseInt(req.params.curatedListId);
    const { name, description } = req.body;

    const rowToUpdate = await CuratedList.findByPk(curatedListId);

    if (!name && !description) {
      return res
        .status(400)
        .json({ error: "name and description not provided." });
    }

    await rowToUpdate.update(
      { name, description },
      { where: { id: curatedListId } }
    );

    await rowToUpdate.save();

    res.status(201).json({ message: "Curated list updated successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update curated lists." });
  }
};

module.exports = { createCuratedList, updateNameAndDescription };
