<?php

namespace VideInfra\CMSBundle\Service;
use Ivory\CKEditorBundle\Form\Type\CKEditorType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class BlockManager
{
    public function getTypes()
    {
        return [
            TextType::class => [
                'name' => 'text',
                'title' => 'Line input',
                'icon' => 'fa fa-file-o'
            ],
            TextareaType::class => [
                'name' => 'textarea',
                'title' => 'Text',
                'icon' => 'fa fa-file-text-o'
            ],
            CKEditorType::class => [
                'name' => 'editor',
                'title' => 'Editor',
                'icon' => 'fa fa-file-text-o'
            ]
        ];
    }
}