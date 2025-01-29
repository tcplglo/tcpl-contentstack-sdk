//import { Client } from "./failing_client";
//Client();

import { HttpClient } from "./contentstackHTTPClient";
import ct_categories from "./data/categories.json";
import ct_products from "./data/products.json";

const client = new HttpClient();

// Entries Functions

const MapVariant = (ct_variant, locale) => {
  let variantPrices = ct_variant.prices.map((price) => {
    return {
      price: {
        ct_price_uid: price.id,
        country: price.country,
        currency_code: price.value.currencyCode,
        cent_amount: price.value.centAmount,
      },
    };
  });

  let variantAttributes = {
    colour: ct_variant.attributes.find(
      (attribute) => attribute.name === "color"
    )?.value[locale],
    finish: ct_variant.attributes.find(
      (attribute) => attribute.name === "finish"
    )?.value[locale],
    product_specification: ct_variant.attributes.find(
      (attribute) => attribute.name === "productspec"
    )?.value[locale],
  };

  let variant = {
    variant_id: ct_variant.id,
    sku: ct_variant.sku,
    prices: variantPrices,
    attributes: variantAttributes,
  };

  return variant;
};

const MapProductToMasterEntry = (product, locale) => {
  let mappedVariant = MapVariant(
    product.masterData.current.masterVariant,
    locale
  );
  let mappedVariants = [mappedVariant];
  product.masterData.current.variants.forEach((variant) => {
    if (variant) {
      mappedVariants.push(MapVariant(variant, locale));
    }
  });

  let masterEntry = {
    entry: {
      ct_uid: product.id,
      title: product.masterData.current.name[locale],
      description: product.masterData.current.description[locale],
      slug: product.masterData.current.slug[locale],
      taxonomies: [
        {
          taxonomy_uid: "products",
          term_uid: product.masterData.current.categories[0].id,
        },
      ],
      variants: mappedVariants,
    },
  };

  let mappedTaxonomies = product.masterData.current.categories.map(
    (category) => {
      return {
        taxonomy_uid: "products",
        term_uid: category.id,
      };
    }
  );

  masterEntry.entry.taxonomies = mappedTaxonomies;

  return masterEntry;
};

const MapLocalisedVariant = (ct_variant, locale) => {
  let variantPrices = ct_variant.prices.map((price) => {
    return {
      price: {
        ct_price_uid: price.id,
        country: price.country,
        currency_code: price.value.currencyCode,
        cent_amount: price.value.centAmount,
      },
    };
  });

  let variantAttributes = {
    colour: ct_variant.attributes.find(
      (attribute) => attribute.name === "color"
    )?.value[locale],
    finish: ct_variant.attributes.find(
      (attribute) => attribute.name === "finish"
    )?.value[locale],
    product_specification: ct_variant.attributes.find(
      (attribute) => attribute.name === "productspec"
    )?.value[locale],
  };

  let variant = {
    variant_id: ct_variant.id,
    sku: ct_variant.sku,
    prices: variantPrices,
    attributes: variantAttributes,
  };

  return variant;
};

const MapProductToLocalisedEntry = (product, locale) => {
  let mappedVariant = MapLocalisedVariant(
    product.masterData.current.masterVariant,
    locale
  );
  let mappedVariants = [mappedVariant];
  product.masterData.current.variants.forEach((variant) => {
    if (variant) {
      mappedVariants.push(MapLocalisedVariant(variant, locale));
    }
  });

  let masterEntry = {
    entry: {
      locale: locale.toLowerCase(),
      ct_uid: product.id,
      title: product.masterData.current.name[locale],
      description: product.masterData.current.description[locale],
      slug: product.masterData.current.slug[locale],
      taxonomies: [
        {
          taxonomy_uid: "products",
          term_uid: product.masterData.current.categories[0].id,
        },
      ],
      variants: mappedVariants,
    },
  };

  let mappedTaxonomies = product.masterData.current.categories.map(
    (category) => {
      return {
        taxonomy_uid: "products",
        term_uid: category.id,
      };
    }
  );

  masterEntry.entry.taxonomies = mappedTaxonomies;

  return masterEntry;
};

let productsToMigrate = ct_products.results;

for (let i = 0; i < productsToMigrate.length; i++) {
  setTimeout(async () => {
    let masterEntry = MapProductToMasterEntry(productsToMigrate[i], "en-US");

    //console.dir(masterEntry, { depth: 7 });

    let contentTypeUid = "ct_product";
    let createEntryResponse = await client.post(
      `content_types/${contentTypeUid}/entries`,
      masterEntry
    );
    //console.dir(createEntryResponse, { depth: 7 });
    let entryUid = createEntryResponse.entry?.uid;

    if (entryUid) {
      console.log("Entry Created", entryUid);

      let locales = ["en-GB", "de-DE"];

      for (let j = 0; j < locales.length; j++) {
        let localisedEntry = MapProductToLocalisedEntry(
          productsToMigrate[i],
          locales[j]
        );

        console.dir(localisedEntry, { depth: 7 });

        let updateLocaliserEntryResponse = await client.put(
          `content_types/${contentTypeUid}/entries/${entryUid}?locale=${locales[
            j
          ].toLowerCase()}`,
          localisedEntry
        );

        console.log(
          "updateLocaliserEntryResponse",
          updateLocaliserEntryResponse
        );
      }
    } else {
      console.log("Entry not created");
      console.dir(createEntryResponse, { depth: 7 });
    }
  }, 1000 * i);
}

let demoEntry = {
  entry: {
    ct_uid: "bd7fe273-9bf2-4c3b-a3c4-6b02a3235cbc",
    title: "example 2",
    description: "this is the glo description",
    slug: "slug",
    taxonomies: [
      {
        taxonomy_uid: "products",
        term_uid: "27ca629d-ca9c-405e-80b0-aa2c083ad48f",
      },
    ],
    variants: [
      {
        variant_id: "Master Variant",
        sku: "MMST-02",
        attributes: {
          colour: "ww",
          finish: "eee",
          product_specification: "ff",
        },
        prices: [
          {
            ct_price_uid: "f489f933-dcc4-49d6-b8c2-da96bcba637a",
            country: "DE",
            currency_code: "EUR",
            cent_amount: 4999,
          },
        ],
      },
    ],
  },
};

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
  for (let i = 0; i < terms.length; i++) {
    setTimeout(async () => {
      let termCreationResponse = await client.post(
        `taxonomies/${productsTaxonomy.uid}/terms`,
        terms[i]
      );
      console.log("termCreationResponse", termCreationResponse);
    }, 1000 * i);
  }
};

// Taxonomies
/*
let productsTaxonomy = await GetProductTaxomony();

if (productsTaxonomy) {
  console.log("Products Taxonomy Exists");
} else {
  console.log("Products Taxonomy Does Not Exist");
  await CreateProductTaxomony();
}

await CreateProductTerms(productsTaxonomy);
*/

// Content Types Functions

const ProductSchema = [
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
  {
    data_type: "group",
    display_name: "Variants",
    field_metadata: { description: "", instruction: "" },
    schema: [
      {
        data_type: "global_field",
        display_name: "Variant",
        reference_to: "variant",
        field_metadata: { description: "" },
        uid: "variant",
        mandatory: false,
        multiple: false,
        non_localizable: false,
        unique: false,
      },
    ],
    uid: "variants",
    mandatory: false,
    multiple: true,
    non_localizable: false,
    unique: false,
  },
];

const CreateProductContentType = async () => {
  let body = {
    content_type: {
      title: "CT-Product",
      uid: "ct_product",
      schema: ProductSchema,
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

const UpdateProductContentType = async () => {
  let body = {
    content_type: {
      title: "CT Product",
      uid: "ct_product",
      schema: ProductSchema,
      options: {
        is_page: false,
        singleton: false,
      },
    },
  };
  await client.put("content_types/ct_product", body);
};

//let productContentType = await GetProductContentType();
//if (productContentType) {
//  console.log("Product Content Type Exists");
// UpdateProductContentType();
//} else {
////  console.log("Product Content Type Does Not Exist");
// await CreateProductContentType();
//}

//console.log("productContentType", productContentType);

//console.dir(ct_categories, { depth: 4 });
