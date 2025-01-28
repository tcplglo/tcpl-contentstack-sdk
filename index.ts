import { HttpClient } from "./contentstackHTTPClient";
import ct_categories from "./data/categories.json";

const client = new HttpClient();

// Taxonomies Functions
const GetProductTaxomony = async () => {
  // get the taxonomies
  let response = await client.get("taxonomies");
  let taxonomies = response.taxonomies as Array<any>;
  let productsTaxonomy = taxonomies.find(
    (taxonomy) => taxonomy.name === "Products"
  );

  return productsTaxonomy;
};

const CreateProductTaxomony = async () => {
  let body = {
    taxonomy: {
      name: "Products",
      uid: "products",
      description: "ct_products_categories",
    },
  };
  await client.post("taxonomies", body);
};

const DeleteProductTaxomony = async () => {
  let params = { force: "true" };
  await client.delete("taxonomies/products", params);
};

const CreateProductTerms = async (productsTaxonomy) => {
  // Create the terms for the Products Taxonomy from categories.json
  let terms = ct_categories.results.map((category) => {
    return {
      term: {
        name: category.name["en-GB"],
        uid: category.id,
        parent_uid: category.parent?.id,
      },
    };
  });

  //console.log("terms", terms);

  // Push the terms to the Products Taxonomy
  terms.forEach(async (term) => {
    await client.post(`taxonomies/${productsTaxonomy.uid}/terms`, term);
  });
};

// Taxonomies
/*
let productsTaxonomy = await GetProductTaxomony();

if (productsTaxonomy) {
  console.log("Products Taxonomy Exists");
} else {
  console.log("Products Taxonomy Does Not Exist");
  await CreateProductTaxomony(productsTaxonomy);
}

await CreateProductTerms();
*/

// Content Types Functions

const CreateProductContentType = async () => {
  let body = {
    content_type: {
      title: "CT-Product",
      uid: "ct_product",
      schema: [
        {
          data_type: "text",
          display_name: "Title",
          field_metadata: {
            _default: true,
            version: 3,
          },
          mandatory: true,
          uid: "title",
          unique: true,
          multiple: false,
          non_localizable: false,
        },
        //(
        //  datat
        //)
      ],
      options: {
        is_page: false,
        singleton: false,
      },
    },
  };
  let result = await client.post("content_types", body);
  console.log("result", result);
};

const GetProductContentType = async () => {
  let response = await client.get("content_types");
  let contentTypes = response.content_types as Array<any>;
  let productContentType = contentTypes.find(
    (contentType) => contentType.uid === "ct_product"
  );

  return productContentType;
};

const UpdateProductContentType = async (productContentType, newSchema) => {
  let body = {
    content_type: {
      title: "CT Product",
      uid: "ct_product",
      schema: newSchema,
      options: {
        is_page: false,
        singleton: false,
      },
    },
  };
  await client.put("content_types/ct_product", body);
};

let productContentType = await GetProductContentType();
if (productContentType) {
  console.log("Product Content Type Exists");
} else {
  console.log("Product Content Type Does Not Exist");
  await CreateProductContentType();
}

console.log("productContentType", productContentType);

//console.dir(ct_categories, { depth: 4 });
