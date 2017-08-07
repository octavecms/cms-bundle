<?php

namespace VideInfra\CMSBundle\Page\Block;

use Symfony\Component\Form\Extension\Core\Type\TextType;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class TextBlock extends AbstractBlock
{
    /**
     * @return string
     */
    public function getName()
    {
        return 'text';
    }

    /**
     * @return string
     */
    public function getLabel()
    {
        return 'Line input';
    }

    /**
     * @return string
     */
    public function getIcon()
    {
        return 'fa fa-file-o';
    }

    /**
     * @return string
     */
    public function getFormType()
    {
        return TextType::class;
    }
}