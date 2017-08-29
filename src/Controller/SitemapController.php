<?php

namespace VideInfra\CMSBundle\Controller;

use Sonata\AdminBundle\Controller\CRUDController;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class SitemapController extends CRUDController
{
    public function listAction()
    {
        return $this->render('VideInfraCMSBundle:Sitemap:list.html.twig', [
            'csrf_token' => 'NANANANANANANA BATMAAAAAAAAN',

            'root_page' => [
                'id' => 'aaa',
                'parent' => null,
                'name' => 'Home page',
                'active' => true,
                'readonly' => true,
                'children' => [
                    [
                        'id' => 'bbb',
                        'parent' => 'aaa',
                        'name' => 'About us',
                        'active' => true,
                        'readonly' => false,
                        'children' => [
                            [
                                'id' => 'eee',
                                'parent' => 'bbb',
                                'name' => 'History',
                                'active' => true,
                                'readonly' => false,
                                'children' => [
                                    [
                                        'id' => 'hhh',
                                        'parent' => 'eee',
                                        'name' => '1920 - 1960',
                                        'active' => true,
                                        'readonly' => false,
                                        'children' => []
                                    ]
                                ]
                            ]
                        ]
                    ],
                    [
                        'id' => 'ccc',
                        'parent' => 'aaa',
                        'name' => 'Services',
                        'active' => false,
                        'readonly' => false,
                        'children' => [
                            [
                                'id' => 'fff',
                                'parent' => 'ccc',
                                'name' => 'Subscription+',
                                'active' => true,
                                'readonly' => false,
                                'children' => []
                            ]
                        ]
                    ],
                    [
                        'id' => 'ddd',
                        'parent' => 'aaa',
                        'name' => 'Contacts',
                        'active' => true,
                        'readonly' => false,
                        'children' => [
                            [
                                'id' => 'ggg',
                                'parent' => 'ddd',
                                'name' => 'Shops',
                                'active' => true,
                                'readonly' => false,
                                'children' => []
                            ]
                        ]
                    ]
                ]
            ]
        ]);

    }
}
