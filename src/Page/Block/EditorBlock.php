<?php

namespace VideInfra\CMSBundle\Page\Block;

use Ivory\CKEditorBundle\Form\Type\CKEditorType;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class EditorBlock extends AbstractBlock
{
    /** @var string */
    private $template;

    /**
     * EditorBlock constructor.
     * @param string $template
     */
    public function __construct($template)
    {
        $this->template = $template;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'editor';
    }

    /**
     * @return string
     */
    public function getLabel()
    {
        return 'Editor';
    }

    /**
     * @return string
     */
    public function getIcon()
    {
        return 'fa fa-file-text-o';
    }

    /**
     * @return string
     */
    public function getFormType()
    {
        return CKEditorType::class;
    }

    /**
     * @return string
     */
    public function getContentTemplate()
    {
        return $this->template;
    }
}