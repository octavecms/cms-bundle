<?php

namespace VideInfra\CMSBundle\Controller;

use Sonata\AdminBundle\Controller\CRUDController;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class MediaController extends CRUDController
{
    public function listAction()
    {
        return $this->render('VideInfraCMSBundle:Media:list.html.twig', [
            'csrf_token' => 'NANANANANANANA BATMAAAAAAAAN',

            'current_category_id' => 'hhh',

            'root_category' => [
                'id' => 'aaa',
                'parent' => null,
                'name' => 'Default Category',
                'children' => [
                    [
                        'id' => 'bbb',
                        'parent' => 'aaa',
                        'name' => 'Inner Category',
                        'children' => [
                            [
                                'id' => 'eee',
                                'parent' => 'bbb',
                                'name' => 'Deep Category',
                                'children' => [
                                    [
                                        'id' => 'hhh',
                                        'parent' => 'eee',
                                        'name' => 'Deeper Category',
                                        'children' => []
                                    ]
                                ]
                            ]
                        ]
                    ],
                    [
                        'id' => 'ccc',
                        'parent' => 'aaa',
                        'name' => 'Another Category',
                        'children' => [
                            [
                                'id' => 'fff',
                                'parent' => 'ccc',
                                'name' => 'Deep Category',
                                'children' => []
                            ]
                        ]
                    ],
                    [
                        'id' => 'ddd',
                        'parent' => 'aaa',
                        'name' => 'Misc Category',
                        'children' => [
                            [
                                'id' => 'ggg',
                                'parent' => 'ddd',
                                'name' => 'Deep Category',
                                'children' => []
                            ]
                        ]
                    ]
                ]
            ]
        ]);
    }
}