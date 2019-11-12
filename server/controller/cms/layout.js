const _ = require('lodash');
const { getServiceApiClient } = require('../../../lib/drupal');

/*
https://www.drupal.org/project/subrequests/issues/3049395#comment-13197337

The Bearer is mandatory to be included ONLY IN THE FIRST request (master). subsequent sub-requests WHICH DEPENDS FROM MASTER REQUEST, "grabs" the token from the master.
in case you have parallel requests which NOT DEPENDS from master, actually creating another master, Auth Header must be RE-INCLUDED
*/
const layoutSubrequest = (lang, theme) => [
  {
    "requestId": "req-1",
    "uri": `/${lang}/jsonapi/block/block?filter[theme]=${theme}`,
    "action": "view",
    "headers": {
      "Accept": "application/json"
    }
  },
  {
    "requestId": "req-2",
    "uri": `/${lang}/jsonapi/menu/menu`,
    "action": "view",
    "headers": {
      // TODO: Add Auth header
      "Accept": "application/json"
    }
  },
  {
    "requestId": "req-3",
    "waitFor": ["req-2"],
    "uri": `/${lang}/jsonapi/menu_link_content/{{req-2.body@$.data[*].attributes.drupal_internal__id}}`,
    "action": "view",
    "headers": {
      "Accept": "application/json"
    }
  },
  {
    "requestId": "req-4",
    "uri": `/${lang}/jsonapi/block_content_type/block_content_type`,
    "action": "view",
    "headers": {
      // TODO: Add Auth header
      "Accept": "application/json"
    }
  },
  {
    "requestId": "req-5",
    "waitFor": ["req-4"],
    "uri": `/${lang}/jsonapi/block_content/{{req-4.body@$.data[*].attributes.drupal_internal__id}}`,
    "action": "view",
    "headers": {
      "Accept": "application/json"
    }
  },
  {
    "requestId": "req-6",
    "uri": `/${lang}/jsonapi/node/fahrziel?fields[node--fahrziel]=drupal_internal__nid,title,field_poi_type&sort=field_poi_type,created`,
    // Taxonomy term
    //"uri": `/${lang}/jsonapi/node/fahrziel?fields[node--fahrziel]=drupal_internal__nid,title,field_poi_type&include=field_poi_type`,
    "action": "view",
    "headers": {
      // TODO: Add Auth header
      "Accept": "application/json"
    }
  }

];

module.exports.cmsLayoutGet = async (req, res, next) => {
  try {
    const axiosAdmin = await getServiceApiClient();
    const drupalTheme = process.env['DRUPAL_THEME'];
    const srResponse = await axiosAdmin.post('/subrequests', layoutSubrequest(res.locals.lang, drupalTheme));

    const layout = srResponse.data.find(response => /req-1/.test(response.headers['Content-Id'])).data;

    const menus = srResponse.data.find(response => /req-2/.test(response.headers['Content-Id'])).data
      .reduce((menusFiltered, menu) => {
        const menuId = menu.attributes.drupal_internal__id;
        const menuBlock = layout.find(block => {
          const blockId = block.attributes.settings.id;
          return blockId.match(new RegExp(`^system_menu_block:${menuId}$`))
        })
        if (menuBlock) {
          menu.__block = menuBlock;
          menu.__links = [];
          menusFiltered.push(menu);
        }
        return menusFiltered;
      }, []);

    const menusLinkContent = srResponse.data.filter(response => /req-3/.test(response.headers['Content-Id']))
      .reduce((menusLinkContentFlattened, response) => {
        menusLinkContentFlattened.push(...response.data)
        return menusLinkContentFlattened
      }, [])
      .filter(menuLinkContent => {
        return menus.find(menu => menu.id === menuLinkContent.relationships.bundle.data.id)
      });
    menusLinkContent.sort((mlc1, mlc2) => {
        return mlc1.attributes.weight - mlc2.attributes.weight;
    });
    menusLinkContent.forEach((menuLinkContent, index, menusLinkContent) => {
      if (menuLinkContent.attributes.parent) {
        const parentMenuLinkContentId = menuLinkContent.attributes.parent.split(':')[1];
        const parentMenuLinkContent = menusLinkContent.find(menuLinkContent => {
          return menuLinkContent.id === parentMenuLinkContentId
        })
        if (parentMenuLinkContent) {
          parentMenuLinkContent.__children = parentMenuLinkContent.__children || [];
          parentMenuLinkContent.__children.push(menuLinkContent);
        }
      }
    });
    menusLinkContent.forEach(menuLinkContent => {
      if (!menuLinkContent.attributes.parent) {
        const menu = menus.find(menu => menu.id === menuLinkContent.relationships.bundle.data.id)
        menu.__links.push(menuLinkContent);
      }
    })

    const blocksContent = srResponse.data.filter(response => /req-5/.test(response.headers['Content-Id']))
      .reduce((blocksContentFlattened, response) => {
        blocksContentFlattened.push(...response.data)
        return blocksContentFlattened
      }, [])
      .reduce((blocksContentFiltered, blockContent) => {
        const blockBlock = layout.find(block => {
          const blockId = block.attributes.settings.id;
          return blockId.match(new RegExp(`^block_content:${blockContent.id}$`))
        })
        if (blockBlock) {
          blockContent.__block = blockBlock;
          blocksContentFiltered.push(blockContent);
        }
        return blocksContentFiltered;
      }, []);

    const nodesPoi = srResponse.data.find(response => /req-6/.test(response.headers['Content-Id'])).data;

    return res.json({ menus, blocks: blocksContent, nodes: { poi: nodesPoi} });
  } catch (error) {
    next(error)
  }
};
